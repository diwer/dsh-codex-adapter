# 兼容范围

## 运行要求

| 项目 | 支持范围 |
| --- | --- |
| 宿主 | DeepSeek Harness 桌面版 0.2.0-rc.2 |
| 操作系统 | macOS；凭证存储依赖 POSIX 权限 |
| 账户 | 已授权且具备订阅模型使用权限的 ChatGPT 账户 |
| 模型 | 以当前账户返回的模型目录为准 |
| 安装脚本 | Node.js ≥22.19；界面安装无需另装 Node.js |

其他宿主版本、Windows、Linux 和远程多用户部署不在当前支持范围内。

## 支持的能力

- 文本流式回复、取消生成、完整会话历史。
- GPT 与 DeepSeek 模型切换，可选的新会话默认 GPT。
- 多账户添加、选择与退出；使用当前账户的权限与额度。
- 支持图片的模型接收 Harness 会话附件；单张默认最多 8 MiB、最多 20 张、编码后合计最多 20 MiB。
- Harness 的工具调用和结果回传，工具执行与审批由宿主负责。
- 推理密文及 assistant phase 的历史回放；中断时保留明确的失败状态。
- 兼容 `response.reasoning_text.delta/done`、`response.output_text.annotation.added` 和订阅路由的 `response.metadata`、`rate_limits.updated` 通知。推理摘要保持流式展示；推理正文在输出项完成后投影，仅在没有摘要文本时展示，避免两条轨道重复输出。注解保存在最终输出项及回放中。

## 使用限制

- 不提供固定模型清单、无限额度或订阅资格保证，也不自动改用 API Key。
- 不支持 `temperature`、`maxTokens`、`stop` 等生成控制参数、hosted MCP 或远程压缩调用。
- 图片仅通过宿主附件服务读取，不从任意本地路径或远程 URL 加载图片。
- 思考强度与默认档位自动读取当前账户模型目录，并过滤 Responses 接口不支持的值。选择模型后，可在 Harness 原生模型菜单中调节；仅目录声明缺失或需限制档位时使用 `modelCapabilities.reasoningEfforts`。上下文窗口仍需显式配置已核实的值，实际上下文管理由 Harness 负责。
- 响应在尚未输出任何内容时提前断开，会等待 500 ms 后最多重试一次。已有文字、思考或工具输出时不自动重放。
- 未支持的内容或工具事件仍会终止本轮，错误消息和 `providerEvent` 提供经过长度及字符检查的事件名，并保留可用的请求 ID；不记录原始事件正文或凭证。新增事件的兼容依据见 [OpenAI 官方流式事件定义](https://developers.openai.com/api/reference/resources/responses/streaming-events)。

[安装与排错](INSTALLATION.md) · [数据与隐私](PRIVACY.md) · [协议说明](AUTH.md) · [开发指南](DEVELOPMENT.md)
