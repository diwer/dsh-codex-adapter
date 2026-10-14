import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { FileCredentialStore } from '../src/auth/index.mjs';

test('file transactions serialize competing OS processes without losing updates', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-auth-processes-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const moduleUrl = new URL('../src/auth/index.mjs', import.meta.url).href;
  const script = `
    import { FileCredentialStore } from ${JSON.stringify(moduleUrl)};
    const store = new FileCredentialStore({ directory: ${JSON.stringify(directory)} });
    for (let i = 0; i < 12; i++) {
      await store.transaction(async state => {
        const value = state.fakeCounter || 0;
        await new Promise(resolve => setTimeout(resolve, 1));
        state.fakeCounter = value + 1;
      });
    }
  `;
  await Promise.all(Array.from({ length: 6 }, () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '--eval', script], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', data => { stderr += data; });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Test child failed (${code}): ${stderr}`)));
  })));
  const count = await new FileCredentialStore({ directory }).transaction(state => state.fakeCounter);
  assert.equal(count, 72);
  assert.deepEqual(await fs.readdir(directory), ['credentials.json']);
});
