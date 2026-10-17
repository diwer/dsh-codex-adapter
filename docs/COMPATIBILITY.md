# 兼容范围

## 运行要求

| 项目 | 支持范围 |
| --- | --- |
| 宿主 | DeepSeek Harness 桌面版 ≥0.2.0-rc.2 |
| 操作系统 | macOS；凭证存储依赖 POSIX 权限 |
| 账户 | 已授权且具备订阅模型使用权限的 ChatGPT 账户 |
| 模型 | 以当前账户返回的模型目录为准 |
| 安装脚本 | Node.js ≥22.19；界面安装无需另装 Node.js |

宿主版本范围声明为 `>=0.2.0-rc.2`，当前实测基线为 macOS 桌面版 `0.2.0-rc.2`；更高版本尚未逐一实测。低于最低版本的宿主、Windows、Linux 和远程多用户部署不在当前支持范围内。

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

## Responses 流事件（开发版）

截至 2026-10-17，已逐项核对 [OpenAI 官方事件清单](https://developers.openai.com/api/reference/resources/responses/streaming-events)的 59 种公开事件，并与固定版本 OpenAI Node SDK 7.36.0 的 ResponseStreamEvent 清单交叉验证。完整匹配表示每个已知事件均有明确处理策略；不表示插件能执行所有上游能力。请求仅声明 Harness 的 function 工具，因此音频、托管搜索、MCP、图片生成、shell 等上游专有能力仍会明确拒绝。

| 精确事件名 | 处理方式 |
| --- | --- |
| `response.created`<br>`response.in_progress`<br>`response.queued` | 核对响应身份与声明的状态 |
| `response.output_item.added`<br>`response.output_item.done` | 配对输出项并保留回放 |
| `response.content_part.added`<br>`response.content_part.done`<br>`response.reasoning_summary_part.added`<br>`response.reasoning_summary_part.done` | 校验 part 类型、索引、结束内容与注解 |
| `response.output_text.delta`<br>`response.refusal.delta`<br>`response.reasoning_summary_text.delta`<br>`response.function_call_arguments.delta` | 转换文本、拒绝、推理摘要或工具参数增量 |
| `response.output_text.done`<br>`response.refusal.done`<br>`response.reasoning_summary_text.done`<br>`response.function_call_arguments.done` | 校验并补齐最终文本／参数，防止重复输出 |
| `response.output_text.annotation.added` | 核对注解并保留在最终回放中 |
| `response.reasoning_text.delta`<br>`response.reasoning_text.done` | 校验推理正文；优先展示摘要，避免重复输出 |
| `response.completed` | 仅合法 completed 响应可成功结束 |
| `response.failed`<br>`response.incomplete`<br>`error` | 终止并报告失败，不执行未完成工具 |
| `response.compaction.compacting`<br>`response.steer.accepted`<br>`response.steer.failed`<br>`response.steer.pending`<br>`response.audio.delta`<br>`response.audio.done`<br>`response.audio.transcript.delta`<br>`response.audio.transcript.done`<br>`response.code_interpreter_call_code.delta`<br>`response.code_interpreter_call_code.done`<br>`response.code_interpreter_call.completed`<br>`response.code_interpreter_call.in_progress`<br>`response.code_interpreter_call.interpreting`<br>`response.file_search_call.completed`<br>`response.file_search_call.in_progress`<br>`response.file_search_call.searching`<br>`response.web_search_call.completed`<br>`response.web_search_call.in_progress`<br>`response.web_search_call.searching`<br>`response.image_generation_call.completed`<br>`response.image_generation_call.generating`<br>`response.image_generation_call.in_progress`<br>`response.image_generation_call.partial_image`<br>`response.mcp_call_arguments.delta`<br>`response.mcp_call_arguments.done`<br>`response.mcp_call.completed`<br>`response.mcp_call.failed`<br>`response.mcp_call.in_progress`<br>`response.mcp_list_tools.completed`<br>`response.mcp_list_tools.failed`<br>`response.mcp_list_tools.in_progress`<br>`response.custom_tool_call_input.delta`<br>`response.custom_tool_call_input.done`<br>`response.shell_call_command.added`<br>`response.shell_call_command.delta`<br>`response.shell_call_command.done`<br>`response.shell_call_output_content.delta`<br>`response.shell_call_output_content.done` | 已识别但当前通道未实现，明确报错 |
| `response.metadata`<br>`rate_limits.updated`<br>`keepalive`<br>`codex.response.metadata`<br>`responsesapi.websocket_timing` | 旁路通知，不产生文字、工具或成功结束 |
| `transport.done` | 传输哨兵，不代替 response.completed |

公开 59 项之外，单独列出 WebSocket steering 控制、订阅旁路通知和内部传输哨兵，不能将它们计入公开 SSE 事件支持数。`keepalive` 依据实际订阅流识别；`codex.response.metadata`、`responsesapi.websocket_timing` 属于 Codex 旁路遥测，不承载输出。`ping` 和其他未证实的别名不会自动放行，未知事件仍报 `PROTOCOL_ERROR`。SSE 注释行无需转换为 JSON 心跳事件。

完成校验覆盖输出项身份、工具 call_id 唯一性、内容轨道与 part 索引、delta → done → 最终快照一致性、注解一致性及响应身份。兼容只在终端提供完整 output 的流；终端 output 为空时，只能使用已独立完成的 output_item.done。EOF、[DONE]、心跳、failed、incomplete 都不能结束为成功。

默认限制：单个 SSE 帧 8 MiB，可见输出与推理正文各最多 32 Mi 字符，完成后的回放最多 32 MiB；待完成输出项身份和注解分别受回放字节预算约束。输出项、整轮累计 part、注解各最多 4096 个。超限、中断或协议不一致均终止，不静默丢弃内容。

实现见 [src/events.mjs](../src/events.mjs) 与 [src/stream.mjs](../src/stream.mjs)，离线清单及来源摘要见 [官方事件快照](../test/fixtures/responses-events-official.json)和 [SDK 快照](../test/fixtures/responses-events-7.36.0.json)。修改策略时必须同步 [事件矩阵测试](../test/events.test.mjs)，不能用前缀通配符放行新内容。

[安装与排错](INSTALLATION.md) · [数据与隐私](PRIVACY.md) · [协议说明](AUTH.md) · [开发指南](DEVELOPMENT.md)
