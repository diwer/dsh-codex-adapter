# DSH ChatGPT 订阅适配器（桌面版）

为 DeepSeek Harness **桌面版 0.2.0-rc.2** 提供 ChatGPT 订阅模型 Provider。使用 OpenAI 公布的 Sign in with ChatGPT 和 Responses API；本插件不是 OpenAI 或 DeepSeek 官方认证产品。

[English](README.en.md) · [许可证](LICENSE) · [市场接入](docs/MARKET_PUBLISHING.md) · [数据与隐私](docs/PRIVACY.md)

[使用文档](https://diwer.github.io/dsh-codex-adapter/) · [AI 可读说明 llms.txt](https://diwer.github.io/dsh-codex-adapter/llms.txt)

[已知市场逐项台账](docs/KNOWN_MARKETS.md) · [市场实装及 GPT 工具验收](docs/MARKET_RUNTIME_ACCEPTANCE.md)

当前发行版本为 **v0.1.1**，仅声明支持 DeepSeek Harness 桌面版 0.2.0-rc.2。安装包见 [GitHub Releases](https://github.com/diwer/dsh-codex-adapter/releases)，安装及升级说明见 [Release 说明](RELEASE_NOTES.md)。npm 及镜像的实际可下载状态以安装验证为准；各市场收录独立推进。

## 安装与登录

使用 npm 官方源安装修订版：`dsh plugin --profile desktop add dsh-codex-official-adapter@0.1.1 --ignore-scripts --registry=https://registry.npmjs.org/`。桌面版请选择对应应用自带的 dsh CLI。若镜像仍返回占位包，请使用官方源；遇到远程包完整性问题时使用下述固定 v0.1.0 的兼容安装路径，其运行功能与 v0.1.1 相同。

推荐使用仓库内的校验安装脚本，避免远程压缩包解析缓存缺少 `integrity` 时反复安装失败：

```sh
git clone https://github.com/diwer/dsh-codex-adapter.git
cd dsh-codex-adapter
node scripts/install-release.mjs \
  --dsh "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  --profile desktop
```

脚本下载固定 v0.1.0 Release，验证固定 SHA-256，再调用官方 CLI 安装本地压缩包；不删除锁文件、不关闭完整性检查，也不自动退出应用。测试版或其他安装位置需将 `--dsh` 改为对应应用自带 CLI，避免装入错误 Profile。需要 Node.js >=22.19。

**已知问题：** 裸 npm 包名可能命中镜像中的 `0.0.0-stage` 占位包；GitHub Release URL 在部分宿主安装路径中报 `ERR_PNPM_MISSING_TARBALL_INTEGRITY`。此前“独立 CLI 安装成功”不代表这些 UI 路径已修复。处理步骤及当前验收范围见[安装故障与校验安装](docs/INSTALLATION.md)。

本地包通过桌面版自带的 DSH 插件管理器安装，包声明匹配桌面版运行时的依赖，不需要版本豁免，不升级桌面应用。

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add --ignore-scripts \
  /absolute/path/to/dsh-codex-official-adapter-0.1.0.tgz
```

1. 在 Harness 的插件清单确认 `dsh-codex-official-adapter` 已启用。
2. 打开“设置 → ChatGPT 订阅”，点击 **连接 ChatGPT**（已连接时显示“添加账户”）。
3. 在浏览器中打开插件提供的授权链接。由本人完成 OpenAI 登录和权限审核，本机授权等待默认 30 分钟，页面显示剩余时间。
4. 授权成功后页面显示“已连接”，点击“刷新模型”查看可用模型。
5. 在新建会话的模型选择器中，选择 **ChatGPT plan (Sign in with ChatGPT)** 下的实际账户模型。

等待时间可通过插件配置 `authorizationTimeoutMs` 设置，单位为毫秒，范围为 1–60 分钟；默认 `1800000`（30 分钟）。回调监听和本地 state 校验使用同一时限。OpenAI 自身的登录会话及授权码有效期由 OpenAI 管理。

这个 Provider 不替换现有 DeepSeek 默认模型。未登录时返回空模型列表；对已选模型发起请求仍会明确报错，绝不自动改用其他 Provider 或付费 API。

## 账户与安全

- 桌面插件独立目录：`~/.dsh/plugin-data/dsh-codex-official-adapter/auth`。
- 目录权限 0700，凭证文件 0600。凭证是明文文件，不是系统钥匙串。
- 不读取 Codex 或其他客户端的登录凭证，不导入浏览器 cookie。
- OAuth 使用动态客户端注册、PKCE、state/nonce、OIDC 身份和签名验证；账户分开记录。
- “退出”会尝试撤销远程刷新会话，然后清除本地 token；如果未确认远程撤销，页面会提示到 ChatGPT 设置断开应用。
- 账户管理接口通过 Harness 原有的 authenticated Connection 路由提供，沿用宿主的认证和来源检查，不创建额外的管理服务器。
- 卸载插件会取消授权等待、中止适配器请求并撤销注册路由。
- 桌面请求使用本插件独立的 TLS dispatcher，合并 Node 与 macOS 已信任的根证书，保持证书校验，不修改全局网络配置。

## 能力与边界

支持文本流、命名空间函数调用及结果、推理密文与 assistant phase 逐轮回放、取消、订阅额度和协议错误处理。DSH 宿主负责工具执行、会话保存及上下文压缩。

请求使用 `store:false`、`stream:true` 和完整历史。不会通过 `previous_response_id` 续接。按账户目录声明文本和图片输入能力；不提供 hosted MCP 等扩展功能。

本路由拒绝 `temperature`、`maxTokens`、`stop` 等不支持的控制参数。模型能力从真实账户目录读取；上下文窗口及推理档位只接受已核实的显式配置。千轮离线历史转换不证明真实上下文容量或压缩成功。

## 开发验证

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npm run test:runtime
npm run test:desktop
```

`test:desktop` 直接使用已安装桌面应用的 Electron 和 ASAR 内的 LLM/Cordis/Schemastery；不以 npm 同版本依赖替代宿主验证。测试使用假账户和受控 HTTP 响应，不证明真实订阅推理成功。

更多：[兼容范围](docs/COMPATIBILITY.md)、[认证协议](docs/AUTH.md)、[官方来源](docs/SOURCES.md)。

桌面插件设置提供“新会话默认使用 GPT（可关闭）”。开启且授权可用时设置 GPT 默认值；关闭恢复原默认模型，保留其他位置的手动默认修改。DeepSeek 与 GPT 的模型选择入口并存，已有会话不被强制切换。

图片输入能力直接读取真实账户模型目录。支持图片的 GPT 模型通过 Harness 附件服务发送 Responses input_image；文本与图片顺序保留，默认单张最多 8 MiB、最多 20 张、编码后合计 20 MiB。已卸载的历史图片保留明确提示，不读取任意文件路径或远程图片 URL。

无任何输出块的响应提前结束时，插件等待 500 ms 后最多重试一次；已输出文字、思考或工具块则不会自动重放。缺少 response.completed 始终判为中断，不伪造成功或回放状态。

开发过程中的内部试跑使用 `npm run test:protocol:diagnostic`：界面仅提示已记录，断言、堆栈、测试退出码和真实通过状态写入 `outputs/test-reports/` 的日志与 JSON 结果。命令成功仅代表记录成功，必须检查结果文件；不能将它作为验收通过依据。完成前运行 `npm run test:protocol` 和 `npm run verify`，最终未通过仍返回非零退出码并明确提示，详细失败内容只保留在日志中。

## 开源与市场发布

```sh
npm run market:check
npm run market:prepare
# 确认真实的公开仓库地址后生成带仓库链接的发布材料
npm run market:prepare -- --repository https://github.com/OWNER/REPOSITORY
```

准备命令只在 `outputs/market/` 生成源代码快照、安装包和提交材料，不上传、不创建仓库、不提交市场申请。GitHub 标签须在远程仓库设置；npm 关键词已经写入清单，发布后才能被 npm 抓取型市场发现。完整渠道和剩余条件见[市场接入清单](docs/MARKET_PUBLISHING.md)。
