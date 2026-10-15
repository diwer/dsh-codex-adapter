import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createAuthClient, FileCredentialStore, AuthError } from './auth/index.mjs';

const HELP = `DSH Codex adapter authentication helper (POSIX only)

Usage:
  node src/cli.mjs login --state-dir /absolute/private/directory [--account ACCOUNT_ID] [--consent]
  node src/cli.mjs accounts --state-dir /absolute/private/directory
  node src/cli.mjs logout --state-dir /absolute/private/directory --account ACCOUNT_ID

login starts an explicit browser OAuth flow and saves this app's credentials in
owner-only local files. It prints a Continue with ChatGPT URL for your browser.
It never imports Codex credentials and does not make an inference request.
Headless DSH uses the same state directory after login. On a remote host, use a
secure loopback tunnel and --port PORT; do not copy tokens or paste them in chat.
`;

/** Human-invoked auth helper. Printing help neither opens a listener nor reads credentials. */
export async function run(argv, {out = text => process.stdout.write(text + '\n'), createClient = createAuthClient, Store = FileCredentialStore} = {}) {
  const {values, positionals} = parseArgs({args:argv, allowPositionals:true, options:{
    'state-dir':{type:'string'}, account:{type:'string'}, port:{type:'string'}, consent:{type:'boolean'}, help:{type:'boolean',short:'h'},
  }});
  if (values.help || !positionals.length) { out(HELP); return 0; }
  const command=positionals[0];
  if (positionals.length !== 1 || !['login','accounts','logout'].includes(command)) throw new Error('Choose login, accounts, or logout.');
  if (!values['state-dir']) throw new Error('--state-dir must be an absolute private directory.');
  if (command !== 'login' && (values.port !== undefined || values.consent)) throw new Error('--port and --consent apply only to login.');
  if (command === 'accounts' && values.account) throw new Error('accounts lists this app’s accounts; omit --account.');
  if (command === 'logout' && !values.account) throw new Error('--account is required for logout.');
  const auth=createClient({store:new Store({directory:values['state-dir']})});
  if (command === 'accounts') { out(JSON.stringify(await auth.accounts(), null, 2)); return 0; }
  if (command === 'logout') {
    const result=await auth.session(values.account).logout();
    out(result.remoteRevoked ? 'Signed out. Renewable session revoked.' : 'Signed out locally. Remote revocation was not confirmed; disconnect the app in ChatGPT Settings.');
    return result.remoteRevoked ? 0 : 2;
  }
  const controller=new AbortController();
  const abort=()=>controller.abort();process.once('SIGINT',abort);
  try {
    out('Continue with ChatGPT to authorize this local app. Credentials will be saved unencrypted in an owner-only directory.');
    const account=await auth.login({accountId:values.account, signal:controller.signal, ...(values.port !== undefined ? {port:Number(values.port)} : {}), promptConsent:values.consent ?? false, onAuthorize:url=>out(url)});
    out(`Account ID: ${account.accountId}`);
    out(account.planUsageEnabled ? 'ChatGPT plan usage is enabled. No inference request was made.' : 'Signed in, but ChatGPT plan usage was not granted. Inference remains disabled.');
    return 0;
  } finally { process.removeListener('SIGINT',abort); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode=await run(process.argv.slice(2)); }
  catch (error) {
    process.stderr.write(error instanceof AuthError ? `${error.message}\n` : 'Command failed. Check the arguments, directory permissions, and account selection.\n');
    process.exitCode=1;
  }
}
