# 最新桌面修复验证

138 项离线测试与 7 项实际桌面 ASAR/Electron 联调通过。新增默认模型开关测试覆盖首次选择 GPT、关闭恢复 DeepSeek、持久化关闭状态、保留用户手动修改、模型请求失败不改变默认值。

真实订阅验证：模型目录 7 个模型，文本 DSH_READY_8362 正常结束，read_probe 工具结果往返、保存后回放恢复、流式取消通过。实际桌面界面点击验收仍等待用户协助；不将宿主库验证等同于完整桌面 UI 验收。

以下保留既有协议测试记录：

# Desktop checkpoint: 2026-10-14

- Target: installed DeepSeek Harness desktop 0.2.0-rc.2, Electron Node 24.18.1, Cordis 4.0.4 and Schemastery 3.18.4.
- Offline suite: **138 passed, 0 failed, 0 skipped**.
- npm rc.2 library integration: **7 passed, 0 failed, 0 skipped**.
- Installed desktop ASAR library integration using the app’s Electron executable: **7 passed, 0 failed, 0 skipped**.
- Syntax: 27 JavaScript modules plus the desktop client bundle checked separately.
- Standard DSH package installation into the actual desktop Profile succeeded. Native desktop UI shows v0.1.0-alpha.3 enabled, its one component running, and Settings → ChatGPT subscription → Continue with ChatGPT.
- Actual desktop button started its own OAuth callback listener. Authorization was opened in Chrome; user consent and live inference are pending.
- No claim of real model, tool, resumed-session or compaction success is made.

See [desktop acceptance](DESKTOP_ACCEPTANCE.md). The following record is the earlier isolated prototype checkpoint, retained for history.

---

# Development checkpoint: 2026-10-14

## Executed

- Node.js v24.19.0; native ESM and node:test; no installed project dependencies.
- `npm run verify`: JavaScript syntax checks plus the complete offline suite.
- `git diff --check` and staged whitespace validation.
- A separate implementation reviewer reran the complete suite and independently inspected request conversion, streaming, replay, errors and plugin lifecycle.

Final checkpoint results: **110 tests passed, 0 failed, 0 skipped**. Syntax validation covered **20 modules**. The tests comprise 45 authentication/storage cases and 65 adapter/stream/request/CLI cases.

## Coverage

- PKCE, one-time state, callback URI, OIDC nonce/issuer/audience/expiry/algorithm/signature/azp, granted scopes, separate registrations and renewal.
- Concurrent token refresh, atomic rotation, terminal versus transient refresh failures, failed remote revocation, cancellation during exchange, timeout preventing late credential writes.
- Protected POSIX store, link/permission rejection, lock timeout and six operating-system processes completing 72 serialized state updates.
- Official API destinations, attribution, namespaced tools, multiple interleaved calls, tool results, subscription-limit errors, no billing fallback or automatic replay.
- Full assistant output replay including encrypted reasoning and assistant phase, block-aligned pruning, mutation detection and explicit thousand-message input histories.
- Byte-split UTF-8 SSE, CR/LF framing, multiline data, incomplete JSON/events, missing completion, failed/incomplete terminal states, bounded events/replay, cancellation and plugin disposal.
- Credential redaction from reflected provider codes/parameters/request IDs; streaming request IDs remain available for safe diagnostics.

The independent review found and the implementation corrected cancellation between buffered chunks, empty-data SSE limit accounting and known-bearer reflection in machine metadata. Additional replay-size and in-progress-item retention hardening was added.

## Not executed

- The separate `npm run test:runtime` suite against installed DSH packages. Five tests are prepared; installation permission is pending. These are not counted as passed or skipped above.
- TypeScript type checking. No TypeScript compiler is installed; `node --check` is syntax validation only.
- Full Web/Headless Profile startup or the user's installed DSH version.
- Actual OpenAI OAuth consent, account token creation/storage, subscription inference, real tool execution or real long-session compaction.
- macOS/Windows runtime matrix. Windows credential storage deliberately fails closed.

No user credentials were read or used, no real API calls were made beyond public read-only documentation/metadata, and no software was installed, published or pushed during this checkpoint.

跨模型历史修复：DeepSeek → GPT 时保留正文及工具调用/结果，不发送其他模型的私有思考块；GPT 模型之间切换先校验原回放，再投影正文及工具记录。同模型 GPT 的原始加密回放保持严格校验。真实跨模型请求返回 SWITCH_READY_9241 并正常 stop。并发凭证锁测试暴露 macOS lstat 与锁释放竞态，现仅在已通过权限检查且链接数为 0 的已删除旧锁上重试独占创建，硬链接/不安全锁仍拒绝。

## 图片输入修复：0.1.0-alpha.8

真实目录包含 input_modalities: [text, image]，旧代码误标为 text-only。现保留目录输入能力，通过实际桌面附件服务读取规范化图像，按 Responses input_image 转换图文。用户/工具的内容顺序保持；同图去重读取、已卸载图片提示、取消及实际数据大小边界均覆盖。真实 GPT-6.1-Sol 从用户截图读取完整英文句子 Received—I'm here and ready. What would you like to test?，stop 结束。完整桌面文本会话 test 已观察到正常回复和“已完成，用时 6 秒”；实际桌面 test 会话图片翻译已通过，界面显示“已完成，用时 10 秒”，重启后记录正常恢复。截图：outputs/desktop-gpt-image-success.png。默认开关验收按用户要求后置。
