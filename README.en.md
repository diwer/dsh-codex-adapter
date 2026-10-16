# DSH ChatGPT Adapter

<p align="center">
  <img src="https://raw.githubusercontent.com/diwer/dsh-codex-adapter/master/lib/assets/big-fish-codex.png" width="144" height="144" alt="Big Fish directing Codex plugin avatar">
</p>

**Bring your ChatGPT subscription to DeepSeek Harness. Sign in, choose GPT, and get to work.**

No API key required. Switch between GPT and DeepSeek, ask about images, and use Harness tools to read files, edit code, search, and run commands.

**For DeepSeek Harness only.** This plugin cannot be installed in the regular DeepSeek chat website, mobile app, or regular chat desktop client. Requires Harness desktop >=0.2.0-rc.2 on macOS; the tested baseline is 0.2.0-rc.2.

[中文](README.md) · [Installation help](docs/INSTALLATION.md) · [Download](https://github.com/diwer/dsh-codex-adapter/releases/latest)

## Why use it

- **Your own subscription** — sign in and authorize access on OpenAI's page.
- **GPT and DeepSeek together** — switch models in a conversation, or make GPT the default for new conversations.
- **Images and tools** — use image-capable models with attachments and Harness's built-in tools.
- **Adjust reasoning effort** — choose a level in the native model menu; available levels and defaults follow your account model.
- **Models load automatically** — see models available to the connected account; add and switch accounts in settings.
- **Independent proxy** — choose environment routing, direct access, or a custom HTTP(S) proxy in subscription settings. Test before saving; changes apply immediately to this plugin.
- **Free and open source** — MIT licensed. Your account determines model access and subscription limits.

## Quick start

Requires **DeepSeek Harness desktop >=0.2.0-rc.2 on macOS** and a ChatGPT account eligible for subscription model access.

1. Open **Plugins → Add plugin** and enter:

   ```text
   dsh-codex-official-adapter@0.1.8
   ```

   Select the **official npm registry (https://registry.npmjs.org/)** and click **Install**. Once current tasks finish, fully quit and reopen Harness. If installation fails, see [alternative installation methods](docs/INSTALLATION.md#其他安装方式).

2. Open **Settings → ChatGPT 订阅 → 连接 ChatGPT**, then **打开授权页面**. Complete sign-in and consent on OpenAI's page. Connection status and available models update automatically.

3. Start a conversation and choose a model under **ChatGPT plan (Sign in with ChatGPT)**. Try: `Read this project and explain what it does.`

## Common questions

**Which product does this plugin support?** DeepSeek Harness only. It cannot be installed in the regular DeepSeek chat website, mobile app, or regular chat desktop client. Requires Harness desktop >=0.2.0-rc.2 on macOS; the tested baseline is 0.2.0-rc.2.

**How do I use my ChatGPT subscription in DeepSeek Harness?** Install `dsh-codex-official-adapter@0.1.8`, connect your own ChatGPT account in settings, and choose a model under ChatGPT plan. No API key is required. Your account determines model access and usage limits.

**Can I install from GitHub?** The source is at `https://github.com/diwer/dsh-codex-adapter`. Installer support varies across hosts and marketplaces; prefer the exact package name and version above.

**No models after sign-in?** Click **刷新模型**. Check account permissions, usage limits, and network access. Available models come from your account.

**Upgrading?** Install the newer version using the same package name and restart Harness. Keep your existing Profile and account directory.

**Uninstalling?** Sign out in plugin settings, then uninstall in Plugins. See [privacy and account removal](docs/PRIVACY.md).

[Compatibility](docs/COMPATIBILITY.md) · [Privacy](docs/PRIVACY.md) · [Release notes](RELEASE_NOTES.md) · [Development](docs/DEVELOPMENT.md)

Conversation text, selected images, and tool results are sent to OpenAI. Credentials are stored in unencrypted local files restricted to the current user. This is an independent community project, not affiliated with OpenAI or DeepSeek.

### Plugin avatar

Enabling the plugin displays the Big Fish & Codex avatar in the bottom-right corner. The artwork ships in the package, uses no external image service, and lets pointer events pass through to the controls underneath. Disabling the plugin removes it.
