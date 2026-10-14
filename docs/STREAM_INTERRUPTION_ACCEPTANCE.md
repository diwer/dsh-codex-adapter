# 响应流提前结束恢复验收

2026-10-14，已将 dsh-codex-official-adapter@0.1.0-alpha.9 标准安装到桌面 Profile，并重启 Harness。实际安装的 adapter.mjs 与测试源码一致。

## 已确认现象与边界

原会话“对插件代码做一次review”在首轮出现 PROTOCOL_ERROR：流结束但缺少 response.completed。原失败没有原始线路记录，截图也不能证明连接为何提前结束，因此没有断言远端故障根因。后续同类只读 review 三次真实请求均有完成事件。

## 修复

无任何输出块返回 Harness 时，干净 EOF 之后等待 500 ms、最多自动重试一次；一旦已有输出块就不重放。宿主通用重试仍关闭，避免重复工具执行。HTTP 额度/鉴权错误、格式错误和取消不进入这条重试路径。

两次均中断或已有部分输出时，明确返回 STREAM_INTERRUPTED 和中文说明，保留安全的请求 ID、HTTP 状态及中断阶段。未收到完成事件不会生成成功终态或完整回放。

## 验收结果

- 142 项测试、7 项实际桌面 ASAR/Electron 联调通过。
- 故障注入：刻意让首次响应在无输出时 EOF；随后自动重试，真实 GPT 完成三次 read 调用及 review，正常 completed。注入的首个空流是本地模拟故障，后续模型请求为真实调用。
- 原桌面会话第 2 轮实际重试成功：读取 src/adapter.mjs、src/sse.mjs、src/request.mjs，界面显示“已完成，用时 54 秒”。没有修改源文件或读取凭证。
- 原第 1 轮错误保留在历史，不改写为成功。用户后来发起的优化任务不计入本次验收。

## 证据

- review-stream-recovery-result.json：故障注入标记、真实响应字节/事件统计、结束状态与工具名称；无原始响应正文或 token。
- review-stream-result.json：同类真实 review 的三个完成事件。
- desktop-review-retry-success.png：原会话重试完成的桌面记录。截图可能同时包含用户后来发起的优化问题，验收对应 17:36 的第 2 轮。

静态 review 中按标准 API key 接口推断模型目录格式的结论，不适用于已实测的 ChatGPT 订阅接口；不能据此替换本插件端点。该模型输出不等同于经验证的代码审查结论。
