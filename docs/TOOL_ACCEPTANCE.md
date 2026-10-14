# 常用工具与模型切换验收

验收日期：2026-10-14（北京时间）。结论：所测常用工具和模型切换流程全部通过。

使用已安装的 dsh-codex-official-adapter@0.1.0-alpha.8、实际桌面 Electron、ASAR 内的 DeepSeek Harness 0.2.0-rc.2 完整 Agent 与工具执行链。测试在独立 Harness home 和验收工作目录运行，通过官方模型选择及会话恢复接口执行，未模拟工具响应。此轮验证执行链和持久会话；未操作模型选择器界面。

会话 ID：`session-tool-acceptance-1791969377468`。五轮均 completed，总计 33 次真实工具调用。

| 轮次 | 实际请求模型 | 验证结果 |
|---|---|---|
| 1 | GPT-6.1-Sol | read、edit、grep、glob、bash；计数 1 → 2；校验文件回读成功 |
| 2 | GPT-6-Luna | 同一持久会话切换模型；read、edit、bash；计数 2 → 3 |
| 3 | DeepSeek-V41-Flash / deepseek-account | GPT → DeepSeek；read、edit、bash；计数 3 → 4 |
| 4 | GPT-6.1-Sol | DeepSeek → GPT；read、edit、glob、bash；计数 4 → 5 |
| 5 | GPT-6.1-Sol | 进程结束后重新加载同一会话；write 创建文件、edit 追加、glob/grep 搜索、read 回读、bash 验证和错误恢复 |

实际磁盘结果：task.txt 的 count=5，名称和 FILE_PROBE_4827 标记行完整保留；created.txt 包含 CREATED_BY_TOOL_4827 和 EDITED_AFTER_RELOAD_4827 两行。所有阶段的终端校验标记与回读结果一致。

错误恢复：读取不存在文件确实返回 not found，未创建该文件；终端命令确实返回退出码 7；之后 read 和 bash 继续执行，实际输出 RECOVERY_OK_4827，整轮正常结束。Harness 将命令退出码写入工具内容，不等同于工具异常的 isError 标记；验收分别检查二者，并以真实回传与磁盘结果判定，不仅采信模型总结。

## 可核对证据

- tools-acceptance.json：实际请求头中的 provider/model、每轮工具列表、完成状态及独立验证结果。
- tools-final-task.txt：最终编辑结果。
- tools-created-file.txt：文件写入和追加编辑结果。
- 验收目录：`/Users/wanheming/Documents/Codex/projects/dsh-codex-adapter/work/tool-agent-workspace`。
- 运行记录：`work/tool-agent-run.log`、`work/tool-switch-run.log`、`work/tool-recovery-run.log`、`work/tool-session-route-summary.json`。

既有桌面会话、插件和默认模型设置保持；未复制其他应用登录凭证，报告不包含 token。未覆盖所有 GPT 型号、第三方 MCP、子代理、Web 工具或长会话压缩，这些不计入此次通过范围。
