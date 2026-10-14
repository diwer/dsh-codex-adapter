# 实际安装与验收记录（2026-10-14）

## 当前结论

已建立正式 Git 项目并安装 DSH 0.2.1-alpha.2。离线校验、真实 DSH 库联调、Headless 启动及 Web 界面加载已验证。真实账号授权尚未完成，不能判定真实推理、工具往返、取消、会话恢复或压缩通过。

## 项目与环境

- 正式项目：`/Users/wanheming/Documents/Codex/projects/dsh-codex-adapter`
- Codex 项目 ID：`c6f54dec-f598-45f8-9a44-c3626aab2a94`；当前聊天已移入该项目。
- 从压缩包的 Git bundle 恢复原提交 `3903681beac084f2a7911b709403b2d609108a62`，分支 `feature/codex-official-subscription-adapter`。
- Node.js 26.4.0；npm 11.17.0。
- 安装 `@deepseek-ai/dsh@0.2.1-alpha.2`、`dsh-llm@0.2.1-alpha.2`、`cordis@4.0.5-alpha.1`、`schemastery@3.18.5-alpha.1`；安装脚本禁用，依赖锁定在 `package-lock.json`。
- 验收使用项目内独立 `DSH_HOME=work/dsh-home`，没有改写既有桌面 Profile。
- 本机原桌面启动器曾核对为 0.2.0-rc.2；本次验证针对独立 0.2.1-alpha.2，并未宣称旧桌面版兼容。

## 实际发现与修正

1. macOS 临时目录路径中的 `/var` 是符号链接。4 项文件存储测试因此被安全检查拒绝。测试先取得临时目录真实路径，保留生产代码拒绝符号链接的保护。
2. 原运行时测试使用不存在的 `ctx.start()` 和 `ctx.dispose()`。改用插件 fiber 的 `await()`、`dispose()`。
3. 原插件用 `ctx.on('dispose')` 绑定清理。改用 Cordis `ctx.effect()`，新增真实框架生命周期回归测试：卸载会中止适配器，Provider 路由会撤回，再次调用得到 `NO_ADAPTER`。

## 已完成的验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| JavaScript 语法 | 21 个模块通过（新增账号目录配置辅助脚本后） | `node scripts/check.mjs` |
| 完整离线测试 | 110 通过，0 失败、0 跳过 | `work/verify-final.log` |
| 真实 DSH 库联调 | 6 通过，0 失败、0 跳过 | `work/runtime-final.log` |
| Headless Profile | 实际启动、创建持久会话、进入 Agent 回合，缺少账号时返回 `not_signed_in` | `work/headless-startup.jsonl`、`work/headless-startup.stderr` |
| Web Profile | 实际启动，内置浏览器加载会话界面；模型选择器显示 `openai-chatgpt-plan/pending-account-model` | 验收截图 |
| 凭证目录权限 | 目录 0700、状态文件 0600；尚无已登录账号 | `accounts` 返回 `[]`，权限已核对 |

这些库联调使用受控模拟 HTTP。Web/Headless 启动是真实应用启动，尚无真实模型回复。

## 接续命令

从项目根目录运行。OAuth 仅通过本插件独立授权，不读取其他客户端 token。

```sh
node src/cli.mjs login --state-dir /absolute/private/path
node scripts/prepare-live-profile.mjs /absolute/private/path
node scripts/prepare-live-profile.mjs /absolute/private/path ACCOUNT_MODEL_SLUG
DSH_HOME="$PWD/work/dsh-home" node node_modules/@deepseek-ai/dsh/lib/bin.js adapter-acceptance --json '只回复 DSH_READY，不使用工具。'
DSH_HOME="$PWD/work/dsh-home" node node_modules/@deepseek-ai/dsh/lib/bin.js adapter-web --host 127.0.0.1 --port 0 --no-open
```

辅助脚本先查询实际账号可用模型，只有用户指定已返回的模型时才更新独立 Profile。预配置的账号和模型是占位符，不能用于真实推理。

## 待完成

- 用户在内置浏览器登录并授予 ChatGPT 订阅调用和离线刷新权限。
- 真实账户模型目录、文本流及模型请求成功终态。
- DSH 工具调用：读取生成的 `work/acceptance-workspace/probe.txt`，核对唯一内容，再形成最终回复。
- 请求取消、持久会话恢复与上下文连贯性。
- 实际 DSH 压缩及压缩后续问；不以离线千轮转换替代。

凭证不进入 Git、压缩包或报告。没有远程发布或推送。原授权流若超过 10 分钟会超时，需要从插件重新发起。

官方授权协议：[Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)。
