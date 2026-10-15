import {randomBytes} from 'node:crypto';

/** Fixed host destination; callback parameters and credentials never enter the page. */
export function harnessSuccessPage(){
  const nonce=randomBytes(24).toString('base64url');
  return {
    contentSecurityPolicy:`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
    html:`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>授权完成 · DeepSeek Harness</title>
  <style nonce="${nonce}">
    :root{color-scheme:light dark;font:16px/1.7 system-ui,sans-serif}
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:light-dark(#f6f7fb,#16181d);color:light-dark(#222631,#edf0f6)}
    main{max-width:32rem;padding:2rem}h1{font-size:1.7rem;margin:0 0 .7rem}
    p{margin:.7rem 0}a{display:inline-block;margin:.6rem 0;padding:.7rem 1.2rem;border-radius:.6rem;background:#4d6bfe;color:white;text-decoration:none}
    a:focus-visible{outline:3px solid currentColor;outline-offset:4px}.hint{font-size:.9rem;opacity:.75}
  </style>
</head>
<body>
  <main>
    <h1>ChatGPT 授权完成</h1>
    <p>正在打开 DeepSeek Harness，请在浏览器提示中允许打开应用。</p>
    <a href="dsh://open">打开 DeepSeek Harness</a>
    <p class="hint">没有自动打开？点击上方按钮，或手动切回 Harness。连接状态会自动更新，此页面可以关闭。</p>
  </main>
  <script nonce="${nonce}">
    history.replaceState(null, '', '/auth/callback');
    window.location.replace('dsh://open');
  </script>
</body>
</html>`,
  };
}
