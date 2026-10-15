# v0.1.2 — 模型思考强度调节

- 在 Harness 原生模型菜单中选择思考强度，无需额外插件或手写配置。
- 自动匹配当前账户模型的档位和默认值，过滤接口不支持的选项。
- 所选强度传递到实际推理请求；切换账户后重新校验模型能力。
- 安装脚本更新至 v0.1.2，并使用发行页 SHA-256 校验文件。

[安装使用](README.md#安装与登录) · [思考强度](docs/REASONING.md) · [下载安装包](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.2)

兼容 Harness 桌面版 0.2.0-rc.2 / macOS。模型可用性与额度以账户为准。

---

# v0.1.1 安装与文档修订

日期：2026-10-15。运行功能与 v0.1.0 相同；此次补充安装辅助脚本、安装故障说明、市场逐项台账和 AI 可读文档。兼容范围仍为桌面 0.2.0-rc.2。

推荐明确版本并使用官方源：`dsh plugin --profile desktop add dsh-codex-official-adapter@0.1.1 --ignore-scripts --registry=https://registry.npmjs.org/`。请使用目标应用自带 CLI。npm 发布不等于镜像同步、市场收录或用户界面验收。

遇到远程 tgz 缺少 integrity 时，使用[校验安装说明](docs/INSTALLATION.md)。辅助脚本仍固定 v0.1.0 及其已发布 SHA-256；它是兼容路径，不声称安装 v0.1.1。保留原 Tag 和发行附件，不删除锁文件或关闭校验。

---

# v0.1.0 Release

日期：2026-10-15。供 DeepSeek Harness 桌面版 **0.2.0-rc.2** 使用的发行版本。[源代码](https://github.com/diwer/dsh-codex-adapter) · [GitHub Releases](https://github.com/diwer/dsh-codex-adapter/releases)。npm 发布与市场收录不计入本版发布结论。

## 本版内容

- 独立 ChatGPT 订阅账户授权，授权等待默认 30 分钟。
- 从真实账户加载可用模型，保留 DeepSeek/GPT 选择入口。
- 图片模型通过宿主附件服务接受图片；宿主工具调用和结果适配。
- 跨模型历史转换、流中断处理和安全回放；未完成的响应不会伪造成功。
- 账户设置页、可关闭的新会话 GPT 默认偏好、市场元数据和 MIT 许可证。

## 安装或升级

将 `dsh-codex-official-adapter-0.1.0.tgz` 保持原样，不要解压。使用桌面版插件管理器添加本地包，或在终端运行：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add --ignore-scripts \
  /absolute/path/to/dsh-codex-official-adapter-0.1.0.tgz
```

把最后一行替换为下载文件的实际路径。等待当前对话任务结束，再完全退出并重开 Harness；仅关闭窗口可能仍保留旧进程。设置页打开“ChatGPT 订阅”，首次使用需要本人登录授权，然后在模型选择器选择账户模型。

已安装 alpha 版本时保持相同包名，通过添加新包覆盖升级；不要先删除 Profile、会话或授权目录。本包不包含任何账户凭证，升级不会主动退出已有账户。

## 验证范围与限制

发行前执行协议回归、完整测试及实际桌面运行时联调，并在独立 Profile 安装发行包、确认路由挂载和卸载。测试账户及 HTTP 响应受控；本轮发行检查不等于重新验证全部真实模型或长期会话压缩。

仅承诺上述桌面宿主版本；其他版本、系统和第三方插件组合需另行验证。模型与订阅可用性由授权账户及上游服务决定。凭证为本插件目录内的明文文件（目录 0700、文件 0600），详见[数据与隐私](docs/PRIVACY.md)。

文件真实性以发行目录 `SHA256SUMS` 为准；本地校验和不是发布者数字签名。
