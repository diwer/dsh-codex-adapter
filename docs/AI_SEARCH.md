# 文档与机器阅读入口

[文档首页](https://diwer.github.io/dsh-codex-adapter/) · [llms.txt](https://diwer.github.io/dsh-codex-adapter/llms.txt) · [完整纯文本](https://diwer.github.io/dsh-codex-adapter/llms-full.txt) · [Sitemap](https://diwer.github.io/dsh-codex-adapter/sitemap.xml)

运行 `npm run docs:build` 生成静态页面、SoftwareApplication / SoftwareSourceCode 元数据、Sitemap 和纯文本说明。用户说明来源于 README；版本、包名和简介来源于 package.json。首页无需 JavaScript 即可阅读和安装。

`llms.txt` 提供产品用途、安装入口、兼容范围与文档链接；完整文本提供上手步骤和数据说明。它们不包含内部测试记录、凭证或个人信息，不代表搜索引擎或 AI 服务保证收录。

## 双语搜索入口与持续构建

独立[英文页面](https://diwer.github.io/dsh-codex-adapter/en.html)与中文首页各自提供 canonical，并通过双向 hreflang 和 x-default 关联；Sitemap 包含两个 HTML 页面。英文页直接回答安装、账户要求、切换、图片工具和兼容问题。版本和下载链接从包清单生成，校验安装说明使用安装器固定版本。Pages 工作流在版本或生成器变化时重新构建。

`npm run verify` 检查页面本地链接、语言对应、结构化版本与目录版本一致性。可抓取性改进不保证搜索引擎已索引、AI 引用或排名；中英文页面及机器阅读入口已通过 GitHub Pages 发布；线上抓取可用不代表搜索引擎已完成索引。

## 产品边界与 AI 搜索可引用性

页面标题、首屏、安装区、常见问答和中英文 README 明确说明：**本插件仅适用于 DeepSeek Harness**，不能安装到 DeepSeek 普通网页版、手机 App 或普通聊天桌面客户端。兼容声明为 Harness 桌面版 ≥0.2.0-rc.2 / macOS，当前实测基线仍为 0.2.0-rc.2。

- 中英文页面由同一模板生成，正文、安装步骤和问答直接包含在 HTML 中，无需执行 JavaScript；复制按钮只做渐进增强。
- 两种语言分别提供 canonical、双向 hreflang、产品名称、明确包名和版本，方便分辨产品、定位安装入口。
- SoftwareApplication / SoftwareSourceCode 结构化数据包括宿主要求、版本、图标、npm 与源码地址；FAQPage 的问题和答案来自页面可见的同一份 README 内容。
- `llms.txt` 提供产品别名、适用边界、npm 包、CLI 安装命令和文档链接；`llms-full.txt` 包含中英文完整说明。
- HTML robots 元数据允许索引和摘要；项目目录生成 `robots.txt`、Sitemap。本站部署在 GitHub Pages 项目子路径，爬虫通常读取域名根目录的 robots.txt；本项目中的文件不能替代宿主根目录规则。

这些措施改善信息完整性、可抓取性和可引用性，不代表 Google、Bing、ChatGPT 或其他 AI 搜索已收录、已引用或保证排名。索引提交、站点所有权验证和实际检索曝光需要单独的证据。
