# 桌面版适配与验收（2026-10-14）

目标是实际安装的 `/Applications/DeepSeek Harness.app`，版本 `0.2.0-rc.2`。

## 已验证的宿主

- Electron 内置 Node.js `24.18.1`，macOS arm64。
- ASAR 内 `@deepseek-ai/dsh-llm@0.2.0-rc.2`、`@deepseek-ai/cordis@4.0.4`、`@deepseek-ai/schemastery@3.18.4`。
- 桌面包匹配上述 peerDependencies；与原 alpha 环境分开保存，未使用版本豁免。
- 正式 DSH bundle 元数据、安装层 patch 和客户端设置区扩展已加入。
- 设置入口支持本插件独立 OAuth、账号状态、账户选择、取消、退出及真实账户模型目录。

## 当前校验

- 离线测试：116 通过，0 失败、0 跳过。
- npm 安装的 rc.2 库联调：7 通过，0 失败、0 跳过。
- 直接用桌面 Electron 与 ASAR 内置库联调：7 通过，0 失败、0 跳过。
- 宿主库联调包含文本块、工具往返与回放、错误类型、无账号启动、管理路由注册与卸载、卸载中止 OAuth listener。

以上 HTTP 均为受控响应；实际登录和订阅模型结果另行验收。

## 安装与真实页面

- 桌面自带 CLI 执行标准 `plugin --profile desktop add --ignore-scripts` 成功。
- `/Users/wanheming/.dsh/profiles/desktop/package.json` 包含本插件依赖及 bundle；原有插件仍在清单中且启用。
- 本插件 `0.1.0-alpha.2` 在真实桌面插件详情中为已启用，`chatgpt-plan-desktop` 唯一组件显示“运行中”。
- 真实桌面“设置 → ChatGPT 订阅”已出现；按钮可调用宿主认证路由并发起 OAuth，显示等待授权及取消按钮。
- 本插件自身的 OAuth 链接已在 Chrome 新标签页打开。当前有 Cloudflare 真人验证，需用户完成。
- 独立凭证目录实际权限为 0700，状态文件 0600；没有复制其他程序的 token。
- 截图：`outputs/desktop-plugin-installed.png`、`outputs/desktop-chatgpt-settings.png`。
- `pnpm peers check` 会报告 Profile 中缺失/冲突的 peer，包括桌面应用从 ASAR 提供而非安装到 Profile 的宿主库。没有据此安装第二套宿主依赖或授予版本豁免；以实际 ASAR 库联调及原生桌面组件“运行中”为当前有效证据。

## 尚未通过

真实 OAuth、真实模型文本/工具调用、真实取消与会话恢复、实际长会话压缩。

历史独立 Web/Headless 验证见 `INSTALLATION_ACCEPTANCE.md`；那份记录不证明桌面版安装。

## 证据文件

`work/desktop-install.log`、`work/desktop-offline.log`、`work/desktop-runtime-npm.log`、`work/desktop-runtime-electron.log`、`work/desktop-syntax.log`。
