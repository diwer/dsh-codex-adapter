# 桌面版适配与验收（2026-10-14）

目标是实际安装的 `/Applications/DeepSeek Harness.app`，版本 `0.2.0-rc.2`。

## 已验证的宿主

- Electron 内置 Node.js `24.18.1`，macOS arm64。
- ASAR 内 `@deepseek-ai/dsh-llm@0.2.0-rc.2`、`@deepseek-ai/cordis@4.0.4`、`@deepseek-ai/schemastery@3.18.4`。
- 桌面包匹配上述 peerDependencies；与原 alpha 环境分开保存，未使用版本豁免。
- 正式 DSH bundle 元数据、安装层 patch 和客户端设置区扩展已加入。
- 设置入口支持本插件独立 OAuth、账号状态、账户选择、取消、退出及真实账户模型目录。

## 当前验收结果

- 离线测试：138 通过，0 失败、0 跳过。
- 实际桌面 Electron 与 ASAR 内置库联调：7 通过，0 失败、0 跳过。
- 真实 OAuth 已完成；本插件自身账户的订阅调用权限可用。未读取其他程序凭证。
- 真实模型目录返回 7 个 GPT 模型；真实 GPT 文本响应正常结束。
- 真实工具调用、文件读取结果往返、保存后完整回放恢复、流式取消均通过。
- 标准桌面 CLI 安装修复版成功；原有 DeepSeek 适配器、插件及会话保留。
- 新增“新会话默认使用 GPT（可关闭）”：开启且授权就绪时选择 GPT；关闭恢复插件修改前的默认值。已有会话不变；关闭时若宿主默认值已经被手动修改，保留手动选择。启动和状态检查不会反复覆盖用户选择。
- 设置接口使用桌面 Connection 的认证/来源限制，只接受受限 JSON。
- 本插件凭证目录为 0700，状态文件为 0600；报告和 Git 不保存凭证。

## 尚待界面验收

自动点击原生桌面的账号菜单和新建会话没有响应，已请求用户手动重启并打开 ChatGPT 订阅设置。当前测试证明适配器和宿主库的真实请求正确；尚不能宣称实际桌面界面中双模型切换和开关点击已经通过。完整桌面 Agent 的长会话压缩也尚未验收。

## 当前证据

`work/verify-alpha5.log`、`work/desktop-alpha5.log`、`work/install-alpha5.log`、`work/live-model-catalog-electron-fixed.json`、`work/live-text-result.json`、`work/live-functional-result.json`。

历史独立 Web/Headless 验证见 `INSTALLATION_ACCEPTANCE.md`；该记录不证明桌面安装。

## 回调超时修复：0.1.0-alpha.3

2026-10-14 16:11:36（北京时间）核对：旧回调端口 63211 没有监听；桌面 Host PID 2056 仍自 15:50:53 持续运行；插件显示登录尝试已结束。原因是原本 10 分钟的本机授权等待结束后关闭回调，浏览器随后返回旧端口。没有使用截图中的授权码，也没有将其记录到文件。

桌面版默认授权等待改为 30 分钟，插件配置 authorizationTimeoutMs 可设为 1–60 分钟。监听、state 校验、对客户端公布的到期时间使用同一配置。界面增加倒计时、明确的超时解释和主动重新发起入口；过期链接会清除。重新发起先取消旧 listener，再生成独立的新 state/PKCE 及回调。

验证：121 项离线测试、7 项实际桌面 ASAR/Electron 联调通过。新增测试证明超过 10 分钟仍可完成本地回调，30 分钟到期后监听关闭，过期后重新授权及主动替换旧 listener 正常。OpenAI 自身的登录会话及授权码有效期独立于本机等待。

## 真实授权后的传输修复：0.1.0-alpha.4

真实账户已完成 OAuth，并获得订阅调用权限。系统 Node 可查询模型，但桌面 Electron 的默认 TLS 信任产生 UNABLE_TO_GET_ISSUER_CERT_LOCALLY。使用桌面可访问的系统信任证书后，真实账户模型目录查询成功。现采用本插件私有 Undici Agent，合并 Node 与系统信任证书，rejectUnauthorized 保持 true，不修改全局 dispatcher 或 TLS 状态。原界面将模型传输错误改写成认证错误，现保留适配器安全错误类型。

真实订阅接口的 SSE 可以省略 Content-Type；response.completed 也可以发送 output: []，而输出已通过 output_item.done 完成。适配器接受前一种缺省情况，但仍严格校验帧、事件、字节/字符上限和 completed 终态。后一种情况只使用全部已经完成并校验过的 streamed items；有未完成项目时仍拒绝。

实际桌面 Electron、实际 ASAR 库与真实账户模型 gpt-6.1-sol 返回 DSH_READY_8362，完成状态为 stop，保存 1 个对应回放块。此记录与仅得到 HTTP 200 或部分文字的失败请求区分。

随后真实工具往返、保存后回放恢复和取消均已通过；实际桌面界面验收仍待完成。

跨模型历史修复：DeepSeek → GPT 时保留正文及工具调用/结果，不发送其他模型的私有思考块；GPT 模型之间切换先校验原回放，再投影正文及工具记录。同模型 GPT 的原始加密回放保持严格校验。真实跨模型请求返回 SWITCH_READY_9241 并正常 stop。并发凭证锁测试暴露 macOS lstat 与锁释放竞态，现仅在已通过权限检查且链接数为 0 的已删除旧锁上重试独占创建，硬链接/不安全锁仍拒绝。

## 图片输入修复：0.1.0-alpha.8

真实目录包含 input_modalities: [text, image]，旧代码误标为 text-only。现保留目录输入能力，通过实际桌面附件服务读取规范化图像，按 Responses input_image 转换图文。用户/工具的内容顺序保持；同图去重读取、已卸载图片提示、取消及实际数据大小边界均覆盖。真实 GPT-6.1-Sol 从用户截图读取完整英文句子 Received—I'm here and ready. What would you like to test?，stop 结束。完整桌面文本会话 test 已观察到正常回复和“已完成，用时 6 秒”；实际桌面 test 会话图片翻译已通过，界面显示“已完成，用时 10 秒”，重启后记录正常恢复。截图：outputs/desktop-gpt-image-success.png。默认开关验收按用户要求后置。
