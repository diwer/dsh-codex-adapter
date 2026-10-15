# 文档与机器阅读入口

[文档首页](https://diwer.github.io/dsh-codex-adapter/) · [llms.txt](https://diwer.github.io/dsh-codex-adapter/llms.txt) · [完整纯文本](https://diwer.github.io/dsh-codex-adapter/llms-full.txt) · [Sitemap](https://diwer.github.io/dsh-codex-adapter/sitemap.xml)

运行 `npm run docs:build` 生成静态页面、SoftwareApplication / SoftwareSourceCode 元数据、Sitemap 和纯文本说明。用户说明来源于 README；版本、包名和简介来源于 package.json。首页无需 JavaScript 即可阅读和安装。

`llms.txt` 提供产品用途、安装入口、兼容范围与文档链接；完整文本提供上手步骤和数据说明。它们不包含内部测试记录、凭证或个人信息，不代表搜索引擎或 AI 服务保证收录。

## 双语搜索入口与持续构建

独立[英文页面](https://diwer.github.io/dsh-codex-adapter/en.html)与中文首页各自提供 canonical，并通过双向 hreflang 和 x-default 关联；Sitemap 包含两个 HTML 页面。英文页直接回答安装、账户要求、切换、图片工具和兼容问题。版本和下载链接从包清单生成，校验安装说明使用安装器固定版本。Pages 工作流在版本或生成器变化时重新构建。

`npm run verify` 检查页面本地链接、语言对应、结构化版本与目录版本一致性。可抓取性改进不保证搜索引擎已索引、AI 引用或排名；本次未发布线上页面。
