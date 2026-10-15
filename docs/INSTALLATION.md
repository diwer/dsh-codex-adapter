# 安装故障与校验安装

更新于 2026-10-15。插件运行版本仍为 v0.1.0；本次增加安装辅助脚本及说明，不替换已发布的版本 Tag 或 tgz。

## 两种已确认的错误

1. `declares no dsh.bundle`：安装源返回 `0.0.0-stage` 占位包，而非可运行插件。已在大陆镜像源观察到；更换源后仍需确认版本和 tarball 实际可下载。
2. `ERR_PNPM_MISSING_TARBALL_INTEGRITY`：宿主通过远程 tgz URL 安装时，其解析结果/锁条目没有 `integrity`。不能据此认定用户的文件遭篡改。本插件包内已有正确 `dsh.bundle`，更改插件业务代码不能修复宿主生成锁文件的这一环节。独立 CLI 曾成功安装同一 URL，测试桌面 UI 仍复现失败，根因尚未定位到宿主或 pnpm 的具体代码。

**同一远程 URL 不是已修复的安装入口。** 不要求用户反复重试、删除整个锁文件、升级 pnpm 或关闭完整性检查。

## 当前可用路径

从仓库根目录运行：

```sh
node scripts/install-release.mjs \
  --dsh "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  --profile desktop
```

macOS 测试版需明确选择它自己的 CLI：

```sh
node scripts/install-release.mjs \
  --dsh "/Applications/deepseek-harness-test.app/Contents/Resources/runtime/cli/bin/dsh" \
  --profile desktop
```

其他平台：提供实际官方 `dsh` 可执行文件，或在 PATH 已正确配置时省略 `--dsh`。当前实装验证限 macOS 桌面 0.2.0-rc.2；不将其他平台列为已实测。

脚本将固定版本存入用户缓存目录，校验下列固定 SHA-256；不匹配立即终止，不调用安装器。可用 `--archive 已下载的.tgz` 校验并安装现有本地包，用 `--cache-dir 路径` 明确指定缓存位置。不要删除仍被 Profile 引用的本地压缩包。

```text
937000caa727e8dc26813bc304f255d913c1d621a32702ec58e12e04127c7c14
```

随后由目标应用的官方 CLI 执行 `plugin --profile desktop add 本地绝对路径 --ignore-scripts --registry=https://registry.npmjs.org/`。本插件脚本不编辑宿主锁文件、插件列表或其他插件；官方安装器仍负责依赖解析、bundle 登记和错误诊断。安装完成后，等当前任务结束，再完全退出并重开对应应用。

## 验收边界

测试桌面 Profile 已通过本地包安装，生成正确 SHA-512 integrity，17 个运行文件与发行包一致，既有依赖和 bundle 保留。图形界面的自动退出未生效，因此该次重启后的界面加载尚未确认。此前另一个独立市场 Profile 已通过真实 GPT 文件读取、编辑和回读，不能用其结果替代本测试桌面的加载验收。

公开发行包及独立校验和见 [v0.1.0 Release](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.0)。市场覆盖和外部收录状态见[逐项台账](KNOWN_MARKETS.md)及[实际市场验收](MARKET_RUNTIME_ACCEPTANCE.md)。
