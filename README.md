# DSH ChatGPT 订阅适配器（桌面版）

为 DeepSeek Harness **桌面版 0.2.0-rc.2** 提供 ChatGPT 订阅模型 Provider。使用 OpenAI 公布的 Sign in with ChatGPT 和 Responses API；本插件不是 OpenAI 或 DeepSeek 官方认证产品。

## 安装与登录

本地包通过桌面版自带的 DSH 插件管理器安装，包声明匹配桌面版运行时的依赖，不需要版本豁免，不升级桌面应用。

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add --ignore-scripts \
  /absolute/path/to/dsh-codex-official-adapter-0.1.0-alpha.9.tgz
```

1. 在 Harness 的插件清单确认 `dsh-codex-official-adapter` 已启用。
2. 打开“设置 → ChatGPT 订阅”，点击 **Continue with ChatGPT**。
3. 复制授权链接并在 Chrome 打开；也可点击授权页链接使用系统浏览器。由本人完成 OpenAI 登录和权限审核，本机授权等待默认 30 分钟，页面显示剩余时间。
4. 授权成功后页面显示已登录，点击“刷新可用模型”。
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

请求使用 `store:false`、`stream:true` 和完整历史。不会通过 `previous_response_id` 续接。输入声明为文本，不提供直接图像上传或 hosted MCP 等扩展功能。

本路由拒绝 `temperature`、`maxTokens`、`stop` 等不支持的控制参数。模型能力从真实账户目录读取；上下文窗口及推理档位只接受已核实的显式配置。千轮离线历史转换不证明真实上下文容量或压缩成功。

## 开发验证

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npm run test:runtime
npm run test:desktop
```

`test:desktop` 直接使用已安装桌面应用的 Electron 和 ASAR 内的 LLM/Cordis/Schemastery；不以 npm 同版本依赖替代宿主验证。测试使用假账户和受控 HTTP 响应，不证明真实订阅推理成功。

更多：[桌面验收记录](docs/DESKTOP_ACCEPTANCE.md)、[认证协议](docs/AUTH.md)、[官方来源](docs/SOURCES.md)。

桌面插件设置提供“新会话默认使用 GPT（可关闭）”。开启且授权可用时设置 GPT 默认值；关闭恢复原默认模型，保留其他位置的手动默认修改。DeepSeek 与 GPT 的模型选择入口并存，已有会话不被强制切换。

图片输入能力直接读取真实账户模型目录。支持图片的 GPT 模型通过 Harness 附件服务发送 Responses input_image；文本与图片顺序保留，默认单张最多 8 MiB、最多 20 张、编码后合计 20 MiB。已卸载的历史图片保留明确提示，不读取任意文件路径或远程图片 URL。

无任何输出块的响应提前结束时，插件等待 500 ms 后最多重试一次；已输出文字、思考或工具块则不会自动重放。缺少 response.completed 始终判为中断，不伪造成功或回放状态。

开发时可运行 `npm run test:protocol`：仅验证适配器、请求转换和 SSE 三组核心协议，终端优先显示中文通过/失败统计及失败项，完整 TAP 日志保存在 `outputs/test-reports/`。该入口保留失败和异常退出码，不会因日志摘要而把失败报告成成功；`npm run verify` 仍运行完整测试。
