# 开发指南

需要 Node.js ≥22.19。宿主依赖的版本见 [package.json](../package.json)。

## 本地验证

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run test:protocol
npm run verify
npm run test:runtime
npm run market:check
npm run docs:build
```

macOS 已安装目标桌面应用时，可运行 `npm run test:desktop` 验证真实桌面运行时。离线测试使用受控响应，不能替代真实账户、工具执行与长期会话验收。

内部协议试跑使用 `npm run test:protocol:diagnostic`。检查 `outputs/test-reports/` 中结果文件的 `passed` 与 `exitCode`；命令成功只表示日志记录完成。原始失败日志与验收记录仅保存在 `outputs/`，不随安装包发布。

## 主要入口

| 文件 | 用途 |
| --- | --- |
| `src/desktop-plugin.mjs` | 桌面服务注册和受认证保护的账户接口 |
| `lib/client.js` | 账户、授权与模型设置界面 |
| `src/adapter.mjs` | 模型目录、请求和流式回复 |
| `src/request.mjs`、`src/stream.mjs`、`src/sse.mjs` | 历史转换、事件解析与输出块 |
| `src/auth/` | OAuth、身份校验及本地凭证存储 |
| `scripts/build-docs.mjs` | 生成静态文档、机器阅读入口和作者目录 |

修改用户界面时保留宿主样式、Profile、会话和其他插件。验证使用独立 Profile，不读取其他客户端凭证。公开问题与日志应移除个人信息和授权链接。

## 文档与分发

修改 README、版本或产品简介后执行 `npm run docs:build`。站点从 README 读取用户说明，并从 package.json 读取版本与简介。

运行 `npm run market:prepare -- --repository https://github.com/diwer/dsh-codex-adapter` 生成允许公开的源码快照、安装包及 SHA-256。输出位于 `outputs/market/`，不自动上传或提交。[分发指南](MARKET_PUBLISHING.md)。
