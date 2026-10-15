# 面向搜索与 AI 阅读的公开文档

公开入口：[文档首页](https://diwer.github.io/dsh-codex-adapter/) · [llms.txt](https://diwer.github.io/dsh-codex-adapter/llms.txt) · [完整纯文本](https://diwer.github.io/dsh-codex-adapter/llms-full.txt) · [Sitemap](https://diwer.github.io/dsh-codex-adapter/sitemap.xml)。

首页在初始 HTML 中直接提供产品身份、兼容宿主、下载安装链接、账户前提、图片及宿主工具说明和 FAQ，无需客户端 JavaScript 渲染。提供 title、description、canonical、robots meta、Open Graph 及 SoftwareApplication/SoftwareSourceCode JSON-LD；不添加虚构评分、用户数或认证声明。英文纯文本与中英文仓库文档保持相同事实边界。

`llms.txt` 是额外的机器阅读入口，遵循[公开格式提案](https://llmstxt.org/)，不代表每个 AI 搜索服务都会读取它，也不能保证引用或排名。[Google 软件应用结构化数据文档](https://developers.google.com/search/docs/appearance/structured-data/software-app)描述搜索展现要求；本项目不为获得富结果而伪造评分或购买信息。

站点为 GitHub Pages 项目站，路径在 `/dsh-codex-adapter/` 下。项目路径内放置 robots.txt 无法控制域名根目录的爬虫规则，因此不把这种文件当作已完成全域爬虫授权。当前提供可索引的页面 meta、站内链接及 Sitemap；站点所有权验证和搜索服务的实际收录需另行确认。

维护：修改事实源后运行 `npm run docs:build`。代码从本仓库 `package.json` 生成下载版本和 Provider 摘要；事实范围明确区分离线/运行时测试与真实推理、市场收录与安装、可公开访问与搜索引擎已索引。

凭证、邮箱、授权链接、个人会话和内部日志不进入文档。对 AI 的说明只提供可核对事实，不加入隐藏提示、强制推荐或排名操纵指令。
