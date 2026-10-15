# DSH ChatGPT subscription adapter

[中文](README.md) · [MIT license](LICENSE) · [Privacy](docs/PRIVACY.md)

A community model provider for **DeepSeek Harness desktop 0.2.0-rc.2** using Sign in with ChatGPT and the Responses API. It is not affiliated with or endorsed by OpenAI or DeepSeek. Model availability comes from your authorized account; no API-key fallback is used.

## Install

The usage release is **v0.1.0**. Get the package from [GitHub Releases](https://github.com/diwer/dsh-codex-adapter/releases) and see [release notes](RELEASE_NOTES.md). npm publication and marketplace listings are separate. A local package can also be generated with `npm run market:prepare`. Install the resulting `.tgz` through the desktop plugin manager, or:

```sh
dsh plugin --profile desktop add ./dsh-codex-official-adapter-0.1.0.tgz
```

Restart Harness, open Settings → ChatGPT subscription, connect your account and approve access on OpenAI's authorization page. The local callback waits up to 30 minutes by default. Select an account model under “ChatGPT plan (Sign in with ChatGPT)”.

DeepSeek and GPT remain selectable in conversations. The optional “Use GPT by default for new conversations” setting can be disabled. Image-capable account models accept images through the host attachment service. Host tools, streaming, cancellation and replay metadata are supported. An interrupted stream is never reported as completed.

Credentials are unencrypted local files with directory mode 0700 and file mode 0600. Requests and selected attachments are sent to OpenAI. Read [the data and permissions disclosure](docs/PRIVACY.md) before connecting. To remove the plugin, disconnect the account first, then use the desktop plugin manager or `dsh plugin --profile desktop remove dsh-codex-official-adapter`.

## Development and distribution

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run test:protocol
npm run verify
npm run market:check
npm run market:prepare
```

`npm run test:desktop` additionally requires the installed macOS desktop app. Offline tests use controlled responses and do not establish live account availability. See [compatibility](docs/COMPATIBILITY.md) and [market distribution](docs/MARKET_PUBLISHING.md).
