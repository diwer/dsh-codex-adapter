# 安装与使用

[返回首页](../README.md) · [下载安装包](https://github.com/diwer/dsh-codex-adapter/releases/latest)

支持 **DeepSeek Harness 桌面版 ≥0.2.0-rc.2 / macOS**。准备好具有订阅模型使用权限的 ChatGPT 账户，无需 API Key。

## 在界面中安装

1. 打开 **Plugins → Add plugin**。
2. 输入 `dsh-codex-official-adapter@0.1.8`。
3. Registry 选择 **npm 官方源（https://registry.npmjs.org/）**，点击 **Install**。
4. 等当前任务结束，完全退出并重开 Harness。仅关闭窗口可能不会退出应用。
5. 在插件列表确认 `dsh-codex-official-adapter` 已启用。

## 连接与使用

1. 打开 **Settings → ChatGPT 订阅 → 连接 ChatGPT**。
2. 点击 **打开授权页面**，在 OpenAI 页面登录并同意授权。链接默认有效 30 分钟，过期后点击“重新授权”。
3. 授权回调成功后会自动打开 Harness；浏览器询问时允许打开应用。若没有自动打开，点击回调页的“打开 DeepSeek Harness”，或手动切回。连接成功后自动加载可用模型。
4. 新建会话，在 **ChatGPT plan (Sign in with ChatGPT)** 下选择模型。

“新会话默认使用 GPT”可以关闭；已有会话保持自己的模型选择。添加图片前，请选择支持图片输入的模型。文件、搜索和终端工具沿用 Harness 的权限设置。

账户列表只展示已登录账户。退出后再次点击“连接 ChatGPT”会复用原注册；要更换账号，点击“使用其他账户”。已连接时可通过“添加账户”连接另一个账号。

## 插件独立代理

在 **Settings → ChatGPT 订阅 → 独立代理** 中配置，无需修改系统代理或其他插件：

| 连接方式 | 行为 |
| --- | --- |
| 跟随环境变量 | 读取 HTTP(S)_PROXY、NO_PROXY；HTTP(S) 类型的 ALL_PROXY 作为后备，不自动读取系统或浏览器代理。 |
| 直连（不使用代理） | 此插件忽略代理环境变量，直接连接 OpenAI。 |
| 自定义代理 | 填写完整 HTTP(S) 代理地址，例如 `http://127.0.0.1:7890`，使用代理软件实际的 HTTP 或混合端口。暂不支持 SOCKS 地址。 |

先点击 **测试连接** 检查当前填写的配置，再点击 **保存并应用**。测试不会保存设置、发送账户凭证或消耗模型额度，只检查授权服务与模型服务是否可达，不验证账户权限或额度。

保存后，新的授权、刷新、模型目录与对话请求立即使用新配置；原生模型菜单会重新加载。正在进行的请求沿用原连接，无需重启 Harness。配置保存在插件私有目录中，重新打开应用后仍然生效。

设置页保存的配置优先于插件高级配置 `proxyUrl`；尚未在此页保存时，继续使用既有 `proxyUrl` 或环境变量。代理配置不随退出 ChatGPT 账户而删除。

## 其他安装方式

### 终端安装

macOS 正式版可直接复制：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add dsh-codex-official-adapter@0.1.8 \
  --ignore-scripts --registry=https://registry.npmjs.org/
```

应用安装在其他位置时，替换命令中的应用路径；测试版应使用测试版应用自带的 CLI。安装后完全退出并重开目标应用。

### 本地包安装

从 [v0.1.8 下载页](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.8)下载 `dsh-codex-official-adapter-0.1.8.tgz`，保持原样，无需解压。将文件的**完整本地路径**填入 Add plugin，或运行：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add \
  "$HOME/Downloads/dsh-codex-official-adapter-0.1.8.tgz" --ignore-scripts
```

文件不在“下载”目录时，替换最后一行的路径。保留安装时使用的本地包，避免影响后续依赖解析。

### 自动下载并校验

已有本仓库和 **Node.js ≥22.19** 时，可使用辅助脚本。脚本下载 v0.1.8、校验发行页的 SHA-256，再调用目标应用的官方安装器：

```sh
node scripts/install-release.mjs \
  --dsh "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  --profile desktop
```

也可添加 `--archive /path/to/package.tgz` 校验并安装已有文件。脚本不会重启应用。

## 安装或连接遇到问题

### 浏览器授权成功，但回调登录失败

升级到 v0.1.8 后完全退出并重开 Harness，重新点击“连接 ChatGPT”。旧回调中的授权码只能使用一次，不要刷新旧页面。

浏览器和插件的网络设置可能不同。请先在上方的 **独立代理** 中选择合适的方式并测试连接；图标启动的 Harness 可能没有代理环境变量。保存成功后再重试模型菜单或重新授权，不要刷新旧的回调链接。高级配置 `proxyUrl` 仍可作为尚未保存独立代理时的初始值。

新版错误会包含阶段（`discovery` 身份配置、`token` 令牌交换、`jwks` 签名公钥）、错误码和 HTTP 状态。例如 `http_error; discovery; HTTP 403` 表示回调已到达，但身份配置请求被拒绝，应先检查网络出口与代理。提交问题时只附这些诊断字段，不附完整回调 URL。

设置页显示实际运行版本。诊断日志位于插件凭证目录下的 `auth-diagnostics.jsonl`（默认 `~/.dsh/plugin-data/dsh-codex-official-adapter/auth/auth-diagnostics.jsonl`）。它记录本地监听端口、回调到达、各官方请求的状态、令牌字段校验、身份验证和凭证保存；不记录 URL、授权码、令牌、邮箱或服务原始响应。文件权限为 `0600`，达到 512 KiB 后保留一份轮转日志 `.1`。`listener_ready` 证明监听已启动，`callback_received` 证明回调已到达，`login_failed` 给出失败阶段与安全诊断字段。

| 现象 | 处理方式 |
| --- | --- |
| `declares no dsh.bundle` 或版本为 `0.0.0-stage` | 改用 npm 官方源，并填写完整包名 `dsh-codex-official-adapter@0.1.8`。 |
| `ERR_PNPM_MISSING_TARBALL_INTEGRITY` | 下载发行包后使用本地路径安装，或运行上面的校验脚本。无需删除锁文件或关闭完整性检查。 |
| GitHub 仓库地址安装失败 | 改用明确的 npm 包名与版本，或下载本地包。仓库名 `dsh-codex-adapter` 与实际 npm 包名不同。 |
| 设置中没有“ChatGPT 订阅” | 确认安装目标应用、desktop Profile 和宿主版本，启用插件后完全退出并重开。 |
| 授权链接过期 | 点击“重新授权”，打开新链接；不要继续刷新旧回调页。 |
| 无法打开本机回调 | 确保在运行 Harness 的同一台 Mac 上完成授权，关闭重复的授权等待后重试。 |
| 已连接但无模型 | 点击“刷新模型”，检查账户的订阅权限、额度和网络；必要时重新授权。 |

## 升级与卸载

升级时使用同一包名安装新版本，然后重启 Harness。保留原 Profile、会话和授权目录。

卸载前先在 **Settings → ChatGPT 订阅** 退出账户，再到 **Plugins** 卸载。远程撤销未确认时，按提示到 ChatGPT 设置断开应用。[数据与隐私](PRIVACY.md)。

仍有问题可[提交 Issue](https://github.com/diwer/dsh-codex-adapter/issues)，附上系统、Harness 版本、插件版本、安装方式及错误码。请勿上传凭证、授权链接或会话正文。
