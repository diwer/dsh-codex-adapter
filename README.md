# DSH Codex 官方订阅协议适配器

独立的 DeepSeek Harness Provider 原型，使用 OpenAI 已公开的 Sign in with ChatGPT 与 Responses API。名称中的“官方”描述所用协议；本项目并非 OpenAI 或 DeepSeek 官方认证产品。

## 当前状态

这是 `0.1.0-alpha.1` 开发版本，已实现可运行的协议核心和离线测试。尚未完成真实账户 OAuth、实际订阅推理、完整 DSH Web/Headless Profile 验收；不能把离线通过等同于生产可用。

- 独立 Provider 路由：`openai-chatgpt-plan`，不覆盖其他 Codex 插件
- 官方动态客户端注册、PKCE、state/nonce、OIDC 签名与账户校验
- 独立账户记录、受保护的 POSIX 文件存储、刷新串行化与原子轮换
- 文本流、函数工具调用与结果、推理密文、assistant phase 的逐轮回放
- 正确处理订阅限额、缺失权限、断流、取消和失败终态；不会自动切换付费 API
- 从账户的官方模型目录读取可选模型；不把固定模型列表当作账户权限
- 显式登录辅助 CLI，供登录后 Web/Headless Profile 共用本项目凭证

## 本地离线验证

仅需现有 Node.js 22.19+，核心测试不下载依赖、不使用账户：

```sh
npm run verify
node src/cli.mjs --help
```

所有自动测试使用虚构凭证与假 HTTP 响应；认证测试的本地回调仅连接本机的测试服务器。运行这些测试不会创建 OpenAI OAuth grant，也不消耗订阅或 API 余额。

## DSH 版本与依赖

参考官方 `deepseek-ai/deepseek-harness` 固定提交 `d743267388641bc76f17c45ce8b4c231aed1d32c`，其公开 LLM 包为 `0.2.1-alpha.2`。当前分支的 API 仍处于预稳定期。本项目不宣称与 `0.1.x`、`0.2.0-rc.2` 或其他版本兼容。

用于真实 DSH 库的离线联调依赖：

```sh
npm --cache .references/npm-cache install --ignore-scripts --no-audit --no-fund --save-dev --save-exact \
  @deepseek-ai/dsh-llm@0.2.1-alpha.2 \
  @deepseek-ai/cordis@4.0.5-alpha.1 \
  @deepseek-ai/schemastery@3.18.5-alpha.1
```

该命令是后续验收步骤，不会由测试自动执行。全部安装脚本被禁用；依赖仅进入此项目。使用者应先确认允许下载并执行相应依赖。

## 显式登录与配置

以下操作会创建或使用个人 OAuth 授权，必须由使用者明确选择；本次开发尚未执行。

```sh
node src/cli.mjs login --state-dir /absolute/path/to/private/dsh-chatgpt-state
node src/cli.mjs accounts --state-dir /absolute/path/to/private/dsh-chatgpt-state
```

在自己的系统浏览器打开 CLI 提供的 Continue with ChatGPT 地址。成功后，CLI 输出非秘密的 account ID。凭证目录由本项目创建并要求仅当前用户可读写；本版文件以明文保存，并未声称使用系统钥匙串。不要将该目录放进仓库、共享目录或同步盘。Windows 文件存储暂不支持，会明确报错。

将 `examples/cordis.patch.yml` 的路径、account ID 和已验证的模型 ID 替换为自己的值。DSH 负责工具执行、文件权限、会话保存及其原有压缩流程；适配器只负责认证和模型传输。不要同时让多个插件注册相同路由。

```sh
node src/cli.mjs logout --state-dir /absolute/path/to/private/dsh-chatgpt-state --account ACCOUNT_ID
```

注销会尝试撤销远程刷新会话，再清除本地 token；如果远程撤销未确认，会明确提示到 ChatGPT 设置中断开应用。

## 当前边界

- 输入能力声明为文本。DSH 可将附件投影为文件句柄/文本；本版没有直接图像或文件上传功能。
- HTTP 请求始终 `store:false`、`stream:true`，完整回放会话，禁止 `previous_response_id`。
- 官方订阅路由不支持 `temperature`、`max_output_tokens` 等参数。本版会拒绝 DSH 的 `temperature`、`maxTokens`、`stop`，不会悄悄忽略。需要在宿主配置中移除这些设置。
- 函数工具放入 `dsh` namespace；本版不启用 hosted MCP、tool_search、图像生成或自定义私有后端。
- 无原生远程压缩端点、自动压缩触发或 token 上限承诺。千轮离线回放测试只证明历史转换，不证明真实上下文容量或压缩效果。
- 不推断模型上下文大小或推理档位。只有经使用者核实后配置的 `modelCapabilities` 才会对 DSH 宣告这些信息。
- 新建 Provider 没有图形化登录页面；可使用显式 CLI 授权。无浏览器的远程主机需要安全的回环端口隧道，不能把其他程序的 token 复制过来。
- 请求失败不会由此适配器或其 Provider 重试策略自动重放。用户/宿主可在明确处理错误后重新发起；订阅额度不足应先检查 ChatGPT Usage。
- 没有读取任何现有 Codex 登录文件、浏览器 cookie 或用户私有配置；没有部署、发布或远程推送。

更多：[认证](docs/AUTH.md)、[兼容性与验收](docs/COMPATIBILITY.md)、[官方来源](docs/SOURCES.md)。
