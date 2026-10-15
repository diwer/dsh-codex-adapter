# 安装与排错

## 快速安装

在 Plugins → Add plugin 输入 `dsh-codex-official-adapter@0.1.2`，选择 npm 官方源（https://registry.npmjs.org/），点击 Install。安装后完全退出并重开 Harness，进入“设置 → ChatGPT 订阅”完成授权。

macOS 正式版也可运行：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add dsh-codex-official-adapter@0.1.2 \
  --ignore-scripts --registry=https://registry.npmjs.org/
```

应用位于其他路径时，请替换 CLI 路径。

## 本地包与校验安装

从 [v0.1.2 Release](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.2) 下载 `.tgz`，无需解压，将完整本地路径填入 Add plugin。

已有仓库和 Node.js ≥22.19 时，可以运行：

```sh
node scripts/install-release.mjs \
  --dsh "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  --profile desktop
```

脚本下载 v0.1.2，并按同一发行页的 `SHA256SUMS` 校验后调用官方安装器。可通过 `--archive 路径 --sha256 已核实的校验值` 校验并安装已有文件。校验不通过则停止，不关闭完整性检查或删除锁文件。发行页校验文件不等于发布者数字签名。

## 常见问题

| 现象 | 处理方式 |
| --- | --- |
| `declares no dsh.bundle` 或版本为 `0.0.0-stage` | 切换到 npm 官方源，填写明确包名与版本。 |
| `ERR_PNPM_MISSING_TARBALL_INTEGRITY` | 下载后使用完整本地路径安装，或运行校验脚本。 |
| 找不到设置入口 | 确认目标应用与 desktop Profile，启用插件后完全退出并重开。 |
| 模型没有思考强度选项 | 确认插件版本为 0.1.2 或更新，再重新选择模型；只对目录中声明支持的模型显示。 |
| 授权过期或模型为空 | 重新授权，再点击“刷新模型”，检查账户权限、额度与网络。 |

升级时安装同包名的新版本并重启，保留 Profile、会话与账户目录。[思考强度](REASONING.md) · [数据与隐私](PRIVACY.md)。
