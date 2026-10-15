# 分发指南

安装入口以[快速开始](../README.md#快速开始)为准。实际 npm 包名是 `dsh-codex-official-adapter`，与仓库名 `dsh-codex-adapter` 不同。

## 发布材料

```sh
npm run test:protocol
npm run verify
npm run market:check
npm run docs:build
npm run market:prepare -- --repository https://github.com/diwer/dsh-codex-adapter
```

`outputs/market/` 中生成公开源码快照、`.tgz`、文件清单、SHA-256 和市场提交材料。准备命令不执行上传或提交。安装包仅包含运行入口、用户说明与许可证；内部日志、验收记录、账户数据和原始 Git 历史不进入源码快照。

## 渠道

- [GitHub Releases](https://github.com/diwer/dsh-codex-adapter/releases)：固定版本安装包与校验文件。
- [npm](https://www.npmjs.com/package/dsh-codex-official-adapter)：供官方 CLI 和支持 npm 的管理器安装；以官方源中的明确版本为准。
- [作者目录](https://diwer.github.io/dsh-codex-adapter/market/plugins.json)：提供包名、仓库、版本和下载元数据。
- 第三方市场：使用 `market/submissions/` 中的元数据，遵守对应目录规则与兼容要求。

第三方安装器应读取实际包名，不从仓库名推导 npm 包。宿主兼容、目录收录及安装功能应分别验证。

## 发布检查

核对目标版本、包内容、下载校验和与 README 安装命令。将包安装到独立 Profile，验证设置入口、账户连接、模型选择和工具调用，保留内部验收记录。升级时保留既有 Profile 和账户目录。

修改站点事实后运行 `npm run docs:build`；文档发布工作流会重新生成页面。机器可读文档见 [AI 阅读入口](AI_SEARCH.md)。

[逐项市场台账](KNOWN_MARKETS.md)区分本次核对规则的渠道和待复核入口。更新版本后先运行 `npm run market:build`，再运行 `npm run docs:build` 和 `npm run market:check`，避免提交材料仍指向旧版本。

## 多目录适配

完整来源、异常排除与各接入格式见[市场台账](KNOWN_MARKETS.md)。新增 1024、ydhrdh、dsh-plugins、cyber-moshen、雷达与固定源码生成器；三种公开 JSON Schema 由 `market:check` 校验。`market:prepare` 同时导出 `submissions/`，对应根社区 YAML 与快照中的材料使用相同版本。固定源码类只在公开 commit 的版本与目标版本一致时生成可提交条目，否则保留 `pinned-registry/status.json` 等待发布后重核。第三方市场安装器没有在用户现有 Profile 内试装。
