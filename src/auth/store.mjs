import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { AuthError, safeError } from './errors.mjs';

const emptyState = () => ({ version: 1, hostId: null, accounts: {} });
const clone = value => structuredClone(value);
function checkState(value) {
  if (!value || value.version !== 1 || !value.accounts || Array.isArray(value.accounts)
    || typeof value.accounts !== 'object' || !(value.hostId === null || typeof value.hostId === 'string')) {
    throw new AuthError('store_error');
  }
  return value;
}

/** Transactions must serialize reads and writes, INCLUDING asynchronous refresh work. */
export class MemoryCredentialStore {
  #state = emptyState();
  #tail = Promise.resolve();
  async transaction(operation) {
    const prior = this.#tail;
    let release;
    this.#tail = new Promise(resolve => { release = resolve; });
    await prior;
    try {
      const draft = clone(this.#state);
      const result = await operation(draft);
      checkState(draft);
      this.#state = clone(draft);
      return result;
    } finally { release(); }
  }
}

/** Explicit opt-in plaintext credential file, protected by POSIX owner-only permissions. */
export class FileCredentialStore {
  #directory;
  #timeout;
  constructor({ directory, lockTimeoutMs = 30_000 } = {}) {
    if (process.platform === 'win32' || typeof process.getuid !== 'function') throw new AuthError('unsupported_platform');
    if (typeof directory !== 'string' || !path.isAbsolute(directory)
      || !Number.isFinite(lockTimeoutMs) || lockTimeoutMs < 0 || lockTimeoutMs > 120_000) throw new AuthError('invalid_options');
    this.#directory = path.resolve(directory);
    this.#timeout = lockTimeoutMs;
  }

  async #prepare() {
    // Refuse symlink components and untrusted writable ancestors. A root-owned sticky
    // temporary root (e.g. /tmp) is safe for an exclusively created private child.
    const parts = this.#directory.split(path.sep).filter(Boolean);
    let current = path.parse(this.#directory).root;
    for (let i = 0; i < parts.length; i++) {
      current = path.join(current, parts[i]);
      try { await fs.mkdir(current, { mode: 0o700 }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      const stat = await fs.lstat(current);
      if (!stat.isDirectory() || stat.isSymbolicLink() || ![0, process.getuid()].includes(stat.uid)) throw new AuthError('insecure_store');
      const leaf = i === parts.length - 1;
      if (leaf) {
        if (stat.uid !== process.getuid() || (stat.mode & 0o077)) throw new AuthError('insecure_store');
      } else if ((stat.mode & 0o022) && !(stat.uid === 0 && (stat.mode & 0o1000))) {
        throw new AuthError('insecure_store');
      }
    }
    if (!parts.length) throw new AuthError('insecure_store');
  }

  async #read() {
    let handle;
    try {
      handle = await fs.open(path.join(this.#directory, 'credentials.json'), constants.O_RDONLY | constants.O_NOFOLLOW);
      const stat = await handle.stat();
      if (!stat.isFile() || stat.uid !== process.getuid() || (stat.mode & 0o077) || stat.nlink !== 1 || stat.size > 1_048_576) {
        throw new AuthError('insecure_store');
      }
      return checkState(JSON.parse(await handle.readFile('utf8')));
    } catch (error) {
      if (error.code === 'ENOENT') return emptyState();
      throw error;
    } finally { await handle?.close(); }
  }

  async #write(state) {
    const temporary = path.join(this.#directory, `.credentials-${randomUUID()}.tmp`);
    let handle;
    try {
      handle = await fs.open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      await handle.writeFile(JSON.stringify(checkState(state)), 'utf8');
      await handle.sync();
      await handle.close();
      handle = undefined;
      await fs.rename(temporary, path.join(this.#directory, 'credentials.json'));
      const directory = await fs.open(this.#directory, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
      try { await directory.sync(); } finally { await directory.close(); }
    } finally {
      await handle?.close();
      await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }

  async transaction(operation) {
    const lockPath = path.join(this.#directory, 'credentials.lock');
    let lock;
    try {
      await this.#prepare();
      const deadline = Date.now() + this.#timeout;
      while (!lock) {
        try { lock = await fs.open(lockPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600); }
        catch (error) {
          if (error.code !== 'EEXIST') throw error;
          let stat;
          try { stat = await fs.lstat(lockPath); }
          catch (statError) { if (statError.code === 'ENOENT') continue; throw statError; }
          if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o077) || stat.nlink > 1) throw new AuthError('insecure_store');
          // macOS can return the unlinked incumbent inode while lstat races its release.
          // Retry exclusive creation; never treat that inode as an acquired lock.
          if (stat.nlink === 0) continue;
          if (Date.now() >= deadline) throw new AuthError('store_busy');
          await sleep(20);
        }
      }
      await this.#prepare();
      const state = await this.#read();
      const before = JSON.stringify(state);
      const result = await operation(state);
      if (JSON.stringify(state) !== before) await this.#write(state);
      return result;
    } catch (error) { throw safeError(error, 'store_error'); }
    finally {
      if (lock) {
        await lock.close();
        await fs.unlink(lockPath).catch(() => {});
      }
    }
  }
}
