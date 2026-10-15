# DeepSeek Harness 插件市场覆盖与适配

核查日期：2026-10-15。公共完整目录 market 分类 + GitHub market 关键词仓库搜索全量分页 + 市场导航及可访问 README 来源链接 + 内置浏览器 Google 搜索；不声称互联网穷尽。

共记录 264 个渠道或相关项目：包/材料契约适配 175 项，不适用 73 项，按用户要求跳过异常及未取得规范的入口 16 项。**这里的“适配”只代表下表声明的发现或提交格式，不代表 175 个独立市场已经上架或安装通过。** 本地管理器、共用数据源的客户端和独立网站均逐项保留，不相加宣传市场覆盖量。

发现源：[完整社区目录](https://awesome-dsh-plugin.com/plugins.json)，4671 条，其中 market 分类 81 条；读取时间 2026-10-15T09:39:15.383Z，SHA-256：`f443f88ebe23a72342063295032911136075e7cb78b289c31b980c24714b3132`。已将这 81 条逐一纳入本表，另已完整分页读取 GitHub market 关键词查询 142/142 条结果，并沿市场导航 52 项入口继续查找；GitHub 大小写别名按同一身份去重。证据和状态定义见[机器台账](../market/coverage.json)。

## 已适配的接入格式

- 当前材料版本 0.1.2。根 package.json、组合 patch、预构建入口、精确宿主 peer、desktop 兼容声明、中英文说明及权限披露；npm 官方源 0.1.1 的包身份和完整性已读取核对；工作区后续版本的远端状态需在发布时重新核对。
- [社区 YAML](../market/submissions/awesome-diwer__dsh-codex-adapter.yml)、[1024 JSON](../market/submissions/1024/catalog/plugins/diwer--dsh-codex-adapter.json)、[ydhrdh JSON](../market/submissions/ydhrdh/registry/plugins/dsh-codex-official-adapter/plugin.json)、[dsh-plugins 描述文件](../market/submissions/dsh-plugins/plugins/dsh-codex-official-adapter.json)、[cyber 目录条目](../market/submissions/cyber-moshen/catalog-entry.json)、[雷达登记行](../market/submissions/radar/PLUGINS-row.md)、[固定源码材料状态](../market/submissions/pinned-registry/status.json)。
- [通用投稿材料](../market/submissions/manual-submission.json)提供仓库、npm、版本、简介、许可、隐私和安装方式；需要人工策展的目录仍由维护者决定是否接纳。
- shop、1024、ydhrdh 三种上游 JSON Schema 保存在[规范快照](../market/schemas/sources.json)，市场检查使用 Ajv 验证实际产物，并核对快照哈希。

固定源码格式在目标版本与已核查公开版本一致时才生成条目；版本不一致则明确记录待发布，不沿用旧 commit。已核查内容见[公开源码快照](../market/public-source.json)中的已检查 commit；不包含本地未提交修改，也不代表第三方维护者已审核。旧 Web 市场能发现或读取本包，不意味着 Web Profile 可运行；本项目兼容范围保持 desktop 0.2.0-rc.2。

## 可访问且已适配的渠道与相关管理器

| 渠道或项目 | 已适配契约 | 依据与限制 |
|---|---|---|
| [DSH 插件精选站](http://dsh-plugins.top) | 根组合包契约、GitHub topic | [来源](http://dsh-plugins.top)；内置浏览器正常读取；站点展示 GitHub 链接，来源为 Top 榜单与 dsh-plugin topic，不要求额外安装格式。 |
| [DSH Plugin Radar](https://adamplatin123.github.io/dsh-plugin-radar/) | 雷达登记行 | [来源](https://github.com/AdamPlatin123/dsh-plugin-radar/blob/main/PLUGINS.md)；已读取登记规范；未伪造运行结论。 |
| [awesome-dsh-plugin](https://awesome-dsh-plugin.com/) | 社区 YAML | [来源](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)；完整目录已刷新；社区 YAML 已生成。 |
| [1024 Store](https://deepseek1024.com/) | 1024 JSON | [来源](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/CONTRIBUTING.md)；目录源码与 API 可访问；按包名搜索未命中，JSON 材料已生成。 |
| [DSH Hub](https://dsh-hub.cc/publish?lang=en) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://dsh-hub.cc/publish?lang=en)；提交页已读取；根 dsh.bundle.patch 和预构建源码满足所述入口，仍需 GitHub 登录后由站点审核发布。 |
| [dsh-plugins-mp.com](https://dsh-plugins-mp.com/) | 通用投稿材料 | [来源](https://github.com/maryasov/dsh-plugins-hub)；公开客户端可读，平台源码为私有；仅完成通用包契约，不宣称私有平台审批通过。 |
| [dsh.directory](https://dsh.directory/) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://dsh.directory/)；浏览器可读取 FAQ；公开仓库提交或 dsh-plugin topic 均经过相同 bundle 契约，已备投稿元数据。 |
| [dsh.market](https://dsh.market/) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://github.com/2BingLing/dsh-market)；站点与公开源码可读；topic 自动发现与提交表单均使用仓库/npm 身份。 |
| [dsh.pub](https://dsh.pub/zh/submit/) | 根组合包契约 | [来源](https://dsh.pub/zh/submit/)；内置浏览器已读取提交页；根包、patch、入口、README 和许可证齐备。 |
| [dshbase](https://dshbase.com/plugins/directory/) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://dshbase.com/plugins/directory/)；页面可读；明确聚合 GitHub dsh-plugin topic 与 dsh.so，可提交仓库 Issue；已具备根包与元数据。 |
| [DSH Find](https://dshfind.com) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://github.com/hikariming/dshfind)；对应公开源码 hikariming/dshfind 已可读取；适配标准包与投稿元数据。 |
| [dshmarket.com](https://dshmarket.com/) | 社区 YAML | [来源](https://github.com/dsh-market/dsh-market#submit-your-plugin)；与 awesome 共用目录，不重复提交市场程序仓库。 |
| [dshmarketplace.dev](https://dshmarketplace.dev/) | 通用投稿材料 | [来源](https://github.com/DshMarketPlace/dsh-plugins-store)；源码可读；安装候选另经该目录的实装门槛，已备 npm 与通用材料。 |
| [DSH Plugin Leaderboard](https://dshpluginleaderboard.com/) | 通用投稿材料 | [来源](https://github.com/sandbaseai/dsh-plugin-store)；客户端公开说明可读；提供仓库/npm/版本/隐私/兼容材料，未宣称收录。 |
| [0326/dsh-plugin-market](https://github.com/0326/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/0326/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [0xsline/awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/0xsline/awesome-deepseek-harness/HEAD/README.md)；已读取公开说明；支持根清单、精确 npm 与通用材料；不宣称维护者已收录。 |
| [dsh-plugin-mall](https://github.com/1e0zj/dsh-plugin-mall) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/1e0zj/dsh-plugin-mall/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-market](https://github.com/2160039878-cyber/dsh-plugin-market) | 固定 commit 条目 | [来源](https://raw.githubusercontent.com/2160039878-cyber/dsh-plugin-market/HEAD/README.md)；固定 commit 生成格式已实现；只在公开源码版本匹配时产出条目。当前目标版本 0.1.2、公开证据版本 0.1.1，不沿用旧 commit 证明新代码。 |
| [250shiwo/dsh-plugin-market](https://github.com/250shiwo/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/250shiwo/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-manager](https://github.com/2768651338/dsh-plugin-manager) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/2768651338/dsh-plugin-manager/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [2BingLing/dsh-market](https://github.com/2BingLing/dsh-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/2BingLing/dsh-market/HEAD/README.md)；已读取公开说明；支持根清单、精确 npm 与通用材料；不宣称维护者已收录。 |
| [6kongbai/dsh-plugin-market](https://github.com/6kongbai/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/6kongbai/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-feed](https://github.com/863683348/dsh-feed) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/863683348/dsh-feed/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-insight](https://github.com/863683348/dsh-insight) | 根组合包契约、通用投稿材料 | [来源](https://raw.githubusercontent.com/863683348/dsh-insight/HEAD/README.md)；内置策展/配方目录需维护者选择；已备元数据，不自行扩大其收录范围。 |
| [dsh-need-finder](https://github.com/863683348/dsh-need-finder) | 根组合包契约、通用投稿材料 | [来源](https://raw.githubusercontent.com/863683348/dsh-need-finder/HEAD/README.md)；内置策展/配方目录需维护者选择；已备元数据，不自行扩大其收录范围。 |
| [dsh-plugin-audit](https://github.com/863683348/dsh-plugin-audit) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/863683348/dsh-plugin-audit/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-recommend](https://github.com/863683348/dsh-plugin-recommend) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/863683348/dsh-plugin-recommend/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-scorecard](https://github.com/863683348/dsh-plugin-scorecard) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/863683348/dsh-plugin-scorecard/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-recipe](https://github.com/863683348/dsh-recipe) | 根组合包契约、通用投稿材料 | [来源](https://raw.githubusercontent.com/863683348/dsh-recipe/HEAD/README.md)；内置策展/配方目录需维护者选择；已备元数据，不自行扩大其收录范围。 |
| [dsh-plugin-market](https://github.com/99galaxy/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/99galaxy/dsh-plugin-market/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [ACEMaravilla/dsh-plugin-market](https://github.com/ACEMaravilla/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/ACEMaravilla/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [AdamPlatin123/awesome-dsh-plugins](https://github.com/AdamPlatin123/awesome-dsh-plugins) | 雷达登记行、GitHub topic | [来源](https://raw.githubusercontent.com/AdamPlatin123/awesome-dsh-plugins/HEAD/README.md)；上游已迁移指向 dsh-plugin-radar；生成登记行，运行级保留待测。 |
| [Awesome DeepSeek Harness Plugins](https://github.com/Alex-Yanggg/awesome-DSH-plugin) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Alex-Yanggg/awesome-DSH-plugin/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-forge](https://github.com/alex04130/dsh-forge) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/alex04130/dsh-forge/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-console](https://github.com/AlexYin-Tongji/dsh-plugin-console) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/AlexYin-Tongji/dsh-plugin-console/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [DSH Community Market](https://github.com/anywhere-labs/deepseek-harness-desktop/tree/master/dsh-community-market) | 精确 npm 包 | [来源](https://github.com/anywhere-labs/deepseek-harness-desktop/blob/master/dsh-community-market/docs/catalog-provider-contract.md)；已读取标准源契约；插件通过目录提供精确 npm 身份，安装仍由宿主验证。未把旧 plugins.json 冒充标准 HTTP provider API。 |
| [DSH Plugin Hub](https://github.com/aust24lzy/dsh-plugin-hub) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/aust24lzy/dsh-plugin-hub/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [Awesome DSH Plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | 社区 YAML | [来源](https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/HEAD/README.md)；完整目录和贡献规则已另外核对，源码 clone 可读；README 超长不影响既有 YAML 适配。 |
| [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/awesome-dsh-plugin/dsh-find-plugin/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [AwesomeHou/dsh-plugin-marketplace](https://github.com/AwesomeHou/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/AwesomeHou/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [huahua-dsh-plugin-orchestra](https://github.com/azure5100/huahua-dsh-plugin-orchestra) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/azure5100/huahua-dsh-plugin-orchestra/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [BeanCookie 精选库](https://github.com/beancookie/awesome-dsh-plugin) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/beancookie/awesome-dsh-plugin/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-bridge](https://github.com/beartackler/dsh-bridge) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/beartackler/dsh-bridge/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [awesome-dsh-plugin](https://github.com/billliao/awesome-dsh-plugin) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/billliao/awesome-dsh-plugin/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [DSH-Plugins-Marketplace](https://github.com/bradeGithub/DSH-Plugins-Marketplace) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/bradeGithub/DSH-Plugins-Marketplace/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [Awesome DSH Plugins](https://github.com/bruc3van/awesome-dsh-plugin) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/bruc3van/awesome-dsh-plugin/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [bruc3van/safer-dsh-market](https://github.com/bruc3van/safer-dsh-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/bruc3van/safer-dsh-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-pluginmanager](https://github.com/buhuikongpan/dsh-pluginmanager) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/buhuikongpan/dsh-pluginmanager/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-plugin-advisor](https://github.com/ChengxiuCDP/dsh-plugin-advisor) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/ChengxiuCDP/dsh-plugin-advisor/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [chnjames/dsh-plugin-market](https://github.com/chnjames/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/chnjames/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [condaThinker/dsh-webui-market-plugin-plus](https://github.com/condaThinker/dsh-webui-market-plugin-plus) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/condaThinker/dsh-webui-market-plugin-plus/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugins#to-english](https://github.com/CREAIT-nl/dsh-plugins/tree/main/to-english) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/CREAIT-nl/dsh-plugins/HEAD/to-english/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-plugin-suite#dsh-plugin-center](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/crTnT/dsh-plugin-suite/HEAD/dsh-plugin-center/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-suite#dsh-plugin-updater](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/crTnT/dsh-plugin-suite/HEAD/dsh-plugin-updater/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [cyber-moshen/dsh-plugin-market](https://github.com/cyber-moshen/dsh-plugin-market) | cyber 目录条目 | [来源](https://raw.githubusercontent.com/cyber-moshen/dsh-plugin-market/HEAD/README.md)；已生成 url、最多 5 个 tags、npm 包名的目录条目；安装与更新采用 npm。 |
| [plugin-switch](https://github.com/cynch18/plugin-switch) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/cynch18/plugin-switch/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-starter-pack](https://github.com/Dariandai/dsh-starter-pack) | 根组合包契约、通用投稿材料 | [来源](https://raw.githubusercontent.com/Dariandai/dsh-starter-pack/HEAD/README.md)；内置策展/配方目录需维护者选择；已备元数据，不自行扩大其收录范围。 |
| [dingchenhui0618-arch/dsh-market-sidebar](https://github.com/dingchenhui0618-arch/dsh-market-sidebar) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/dingchenhui0618-arch/dsh-market-sidebar/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-market](https://github.com/dsh-market/dsh-market) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/dsh-market/dsh-market/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugins/dsh-plugin-market](https://github.com/dsh-plugins/dsh-plugin-market) | dsh-plugins 描述文件 | [来源](https://raw.githubusercontent.com/dsh-plugins/dsh-plugin-market/HEAD/README.md)；已生成本市场 id、双语 description、support_versions 和 urls 格式，保留精确宿主版本。 |
| [dsh-research](https://github.com/dsh-research/dsh-research) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/dsh-research/dsh-research/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [dshhub-market](https://github.com/dshhub-co/dshhub-market) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/dshhub-co/dshhub-market/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [dsh-plugins-store](https://github.com/DshMarketPlace/dsh-plugins-store) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/DshMarketPlace/dsh-plugins-store/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [duxingxiake3/dsh-plugin-market](https://github.com/duxingxiake3/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/duxingxiake3/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-panel](https://github.com/Dylan37670/dsh-plugin-panel) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Dylan37670/dsh-plugin-panel/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-find-plugins](https://github.com/Eray114514/dsh-find-plugins) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Eray114514/dsh-find-plugins/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [DSH 社区插件商店](https://github.com/Ericwong5021/deepseek-plugin-store) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Ericwong5021/deepseek-plugin-store/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-plugin-ops#dsh-plugin-ops-bundle](https://github.com/f-infinite-z/dsh-plugin-ops/tree/main/packages/bundle) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/f-infinite-z/dsh-plugin-ops/HEAD/packages/bundle/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [Femad-6/dsh-lumen-market](https://github.com/Femad-6/dsh-lumen-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Femad-6/dsh-lumen-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [FUSU123fusu/dsh-tui-market](https://github.com/FUSU123fusu/dsh-tui-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/FUSU123fusu/dsh-tui-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Ghost011118/dsh-plugin-marketplace](https://github.com/Ghost011118/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Ghost011118/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugins](https://github.com/hacksing/dsh-plugins) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/hacksing/dsh-plugins/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [harness-home/harness-ai-desktop](https://github.com/harness-home/harness-ai-desktop) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/harness-home/harness-ai-desktop/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Harness Flow Hub](https://github.com/harzva/harness-flow-hub) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/harzva/harness-flow-hub/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dshfind](https://github.com/hikariming/dshfind) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/hikariming/dshfind/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [hoangdtdoothanh-svg/dsh-whale-market](https://github.com/hoangdtdoothanh-svg/dsh-whale-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/hoangdtdoothanh-svg/dsh-whale-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-mall](https://github.com/hoyyang/dsh-mall) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/hoyyang/dsh-mall/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [hskelp9527-pixel/dsh-plugin-market](https://github.com/hskelp9527-pixel/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/hskelp9527-pixel/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-community-plugins](https://github.com/HubaKing/dsh-community-plugins) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/HubaKing/dsh-community-plugins/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-store](https://github.com/huguangyu666/dsh-store) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/huguangyu666/dsh-store/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-scout](https://github.com/icefall7/dsh-plugin-scout) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/icefall7/dsh-plugin-scout/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [awesome-deepseek-harness-plugins](https://github.com/imsai-sh/awesome-deepseek-harness-plugins) | 1024 JSON、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/imsai-sh/awesome-deepseek-harness-plugins/HEAD/README.md)；逐插件 JSON 通过上游 schema；npm 发布身份已核对，未提交目录。 |
| [imsai-sh/dsh-1024store](https://github.com/imsai-sh/dsh-1024store) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/imsai-sh/dsh-1024store/HEAD/README.md)；已读取公开说明；支持根清单、精确 npm 与通用材料；不宣称维护者已收录。 |
| [jacket-sikaha/dsh-market-gist-autosync](https://github.com/jacket-sikaha/dsh-market-gist-autosync) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/jacket-sikaha/dsh-market-gist-autosync/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [JasperGuWP/dsh-plugin-market](https://github.com/JasperGuWP/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/JasperGuWP/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [find-dsh-plugins](https://github.com/JazzuLu/find-dsh-plugins) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/JazzuLu/find-dsh-plugins/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-manager#cli](https://github.com/Jesse-njx/dsh-plugin-manager/tree/main/packages/cli) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Jesse-njx/dsh-plugin-manager/HEAD/packages/cli/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-dejaview](https://github.com/jiang4wqy/dsh-dejaview) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/jiang4wqy/dsh-dejaview/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [jianjianzhu/dsh-harness-ui](https://github.com/jianjianzhu/dsh-harness-ui) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/jianjianzhu/dsh-harness-ui/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [dsh-unified-market](https://github.com/jing-hy/dsh-unified-market) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/jing-hy/dsh-unified-market/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [jli658942-web/dsh-market-skill](https://github.com/jli658942-web/dsh-market-skill) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/jli658942-web/dsh-market-skill/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Awesome DSH Plugins 中文精选](https://github.com/kejixiaoliang/awesome-dsh-plugins) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/kejixiaoliang/awesome-dsh-plugins/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-plugin-market](https://github.com/kimiya1010/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/kimiya1010/dsh-plugin-market/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-manager](https://github.com/kkkkkklze/dsh-plugin-manager) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/kkkkkklze/dsh-plugin-manager/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [KokuYu-sysu/dsh-market-desktop](https://github.com/KokuYu-sysu/dsh-market-desktop) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/KokuYu-sysu/dsh-market-desktop/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Liaominduyh/GitHub-dsh-plugin-market](https://github.com/Liaominduyh/GitHub-dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Liaominduyh/GitHub-dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [awesome-deepseek-harness](https://github.com/libukai/awesome-deepseek-harness) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/libukai/awesome-deepseek-harness/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [lijma/dsh-plugin-marketplace](https://github.com/lijma/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/lijma/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [like-study1/Oh-My-DSH](https://github.com/like-study1/Oh-My-DSH) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/like-study1/Oh-My-DSH/HEAD/README.md)；已读取公开说明；支持根清单、精确 npm 与通用材料；不宣称维护者已收录。 |
| [dsh-plugin-manager](https://github.com/liqichen/dsh-plugin-manager) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/liqichen/dsh-plugin-manager/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-plugin-shop](https://github.com/LivXue/dsh-plugin-shop) | shop schema、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/LivXue/dsh-plugin-shop/HEAD/README.md)；根 dsh.catalog 通过上游严格 schema；兼容声明仍限定 desktop 0.2.0-rc.2。 |
| [dsh-local-installer](https://github.com/ljh257110/dsh-local-installer) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/ljh257110/dsh-local-installer/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-workshop](https://github.com/loguhan/dsh-workshop) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/loguhan/dsh-workshop/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [loker66fan/dsh-market-github](https://github.com/loker66fan/dsh-market-github) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/loker66fan/dsh-market-github/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [lovstudio/dsh-plugin-marketplace](https://github.com/lovstudio/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/lovstudio/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [lpf0404/dsh-compat-market](https://github.com/lpf0404/dsh-compat-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/lpf0404/dsh-compat-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Luaphes/dsh-plugins-market](https://github.com/Luaphes/dsh-plugins-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Luaphes/dsh-plugins-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-registry](https://github.com/majiayu000/dsh-plugin-registry) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/majiayu000/dsh-plugin-registry/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-plugins-hub](https://github.com/maryasov/dsh-plugins-hub) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/maryasov/dsh-plugins-hub/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [dsh-plugin-center](https://github.com/Max-Null/dsh-plugin-center) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Max-Null/dsh-plugin-center/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [mengxingGG/dsh-plugin-marketplace](https://github.com/mengxingGG/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/mengxingGG/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Minglink/dsh-stream-market](https://github.com/Minglink/dsh-stream-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Minglink/dsh-stream-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [mishibeikejie/zat-dsh-engine](https://github.com/mishibeikejie/zat-dsh-engine) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/mishibeikejie/zat-dsh-engine/HEAD/README.md)；已读取公开说明；支持根清单、精确 npm 与通用材料；不宣称维护者已收录。 |
| [Modole/dsh-plugin-market-laoboshi](https://github.com/Modole/dsh-plugin-market-laoboshi) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Modole/dsh-plugin-market-laoboshi/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [mrk-king/dsh-plugin-market](https://github.com/mrk-king/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/mrk-king/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-archive-manager](https://github.com/MS666666/dsh-archive-manager) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/MS666666/dsh-archive-manager/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [NanmiCoder/dsh-plugin-market](https://github.com/NanmiCoder/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/NanmiCoder/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [DSH-Plugin-Market](https://github.com/nanshan1995/DSH-Plugin-Market) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/nanshan1995/DSH-Plugin-Market/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [newbieYi/dsh-plugin-market](https://github.com/newbieYi/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/newbieYi/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [NokorinNishikino/kidai-plugin-market-hub](https://github.com/NokorinNishikino/kidai-plugin-market-hub) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/NokorinNishikino/kidai-plugin-market-hub/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-manager](https://github.com/nonentity303/dsh-plugin-manager) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/nonentity303/dsh-plugin-manager/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [Noob-stupid/dsh-plugin-gating-hub](https://github.com/Noob-stupid/dsh-plugin-gating-hub) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Noob-stupid/dsh-plugin-gating-hub/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [DSH 插件中心](https://github.com/Noob-stupid/dsh-plugin-hub) | 根组合包契约 | [来源](https://raw.githubusercontent.com/Noob-stupid/dsh-plugin-hub/HEAD/README.md)；旧名称已迁移到 Noob-stupid/dsh-plugin-gating-hub；作为别名保留，不计独立市场。 |
| [dsh-deepatlas](https://github.com/Oscar-Williams/dsh-deepatlas) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Oscar-Williams/dsh-deepatlas/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [ouyangyipeng/dsh-marketplace](https://github.com/ouyangyipeng/dsh-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/ouyangyipeng/dsh-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-mgr](https://github.com/oxlyn/dsh-plugin-mgr) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/oxlyn/dsh-plugin-mgr/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [Palpitate1388/dsh-market-sidebar](https://github.com/Palpitate1388/dsh-market-sidebar) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Palpitate1388/dsh-market-sidebar/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [deepseek-plugin-store](https://github.com/pericardiac-podzolsoil527/deepseek-plugin-store) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/pericardiac-podzolsoil527/deepseek-plugin-store/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-plugin-marketplace](https://github.com/PetCT/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/PetCT/dsh-plugin-marketplace/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [phil616/dsh-plugin-market](https://github.com/phil616/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/phil616/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-install](https://github.com/qinyre/dsh-plugin-install) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/qinyre/dsh-plugin-install/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [QT7-C23/DSH-Marketplace](https://github.com/QT7-C23/DSH-Marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/QT7-C23/DSH-Marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [RedMaple96/dsh-plugin-safety](https://github.com/RedMaple96/dsh-plugin-safety) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/RedMaple96/dsh-plugin-safety/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [dsh-extension-hub](https://github.com/Relistencode/dsh-extension-hub) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Relistencode/dsh-extension-hub/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-store](https://github.com/sandbaseai/dsh-plugin-store) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/sandbaseai/dsh-plugin-store/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Sanqi-normal/dsh-webui-market-plugin/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugin-marketplace](https://github.com/Scorp1o117/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/Scorp1o117/dsh-plugin-marketplace/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [shixiaosia/dsh-plugin-marketplace](https://github.com/shixiaosia/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/shixiaosia/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-market](https://github.com/springbrand-lab/dsh-plugin-market) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/springbrand-lab/dsh-plugin-market/HEAD/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [sstar16/dsh-plugin-market](https://github.com/sstar16/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/sstar16/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [awesome-dsh](https://github.com/stakeswky/awesome-dsh) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/stakeswky/awesome-dsh/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [supanexus/dsh-plugin-supanexus-core](https://github.com/supanexus/dsh-plugin-supanexus-core) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/supanexus/dsh-plugin-supanexus-core/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [TeaClearInkII/DSH-Marketplaces-Nexus](https://github.com/TeaClearInkII/DSH-Marketplaces-Nexus) | 根组合包契约 | [来源](https://raw.githubusercontent.com/TeaClearInkII/DSH-Marketplaces-Nexus/HEAD/README.md)；市场导航只收市场本身，本 Provider 由其引用的下游目录发行；本次已读取其完整 52 项入口继续搜索。 |
| [TheYoungChen/dsh-plugin-market](https://github.com/TheYoungChen/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/TheYoungChen/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [ToBeWin/DSH-Plugin-Market](https://github.com/ToBeWin/DSH-Plugin-Market) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/ToBeWin/DSH-Plugin-Market/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [dsh-plugin-diraud](https://github.com/tttwh/dsh-plugin-diraud) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/tttwh/dsh-plugin-diraud/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-plugin-toggle](https://github.com/tuogusa/dsh-plugin-toggle) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/tuogusa/dsh-plugin-toggle/HEAD/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [dsh-plugins-hub](https://github.com/tyeclipse/dsh-plugins-hub) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/tyeclipse/dsh-plugins-hub/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [uluckystar/dsh-plugin-market](https://github.com/uluckystar/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/uluckystar/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [VCPr0j3k7/dsh-desktop-settings](https://github.com/VCPr0j3k7/dsh-desktop-settings) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/VCPr0j3k7/dsh-desktop-settings/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [VCPr0j3k7/dsh-plugin-market](https://github.com/VCPr0j3k7/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/VCPr0j3k7/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [Viveksssss/DeepSeek-harness-marketplace](https://github.com/Viveksssss/DeepSeek-harness-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Viveksssss/DeepSeek-harness-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [plugin-registry#console](https://github.com/vlln/plugin-registry/tree/main/packages/plugin/console) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/vlln/plugin-registry/HEAD/packages/plugin/console/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [WhaleHub](https://github.com/vvlife/whalehub-dsh) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/vvlife/whalehub-dsh/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [w2112515/dsh-plugin-marketplace](https://github.com/w2112515/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/w2112515/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh-plugin-doctor](https://github.com/white-sand-grand/dsh-plugin-doctor) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/white-sand-grand/dsh-plugin-doctor/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-suite](https://github.com/whyihaveyou/dsh-suite) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/whyihaveyou/dsh-suite/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-suite#plugin-manager](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) | 根组合包契约、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/whyihaveyou/dsh-suite/HEAD/packages/plugins/plugin-manager/README.md)；独立目录或人工选择；已备通用提交材料，收录与安装需市场侧完成。 |
| [Wine-Cupable/dsh-plugin-marketplace](https://github.com/Wine-Cupable/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/Wine-Cupable/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [wishesl/dsh-launcher](https://github.com/wishesl/dsh-launcher) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/wishesl/dsh-launcher/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [wsifan31-bit/Smart-DSH-Market](https://github.com/wsifan31-bit/Smart-DSH-Market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/wsifan31-bit/Smart-DSH-Market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [WZZNNE/DSH-CyberWorkStation](https://github.com/WZZNNE/DSH-CyberWorkStation) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/WZZNNE/DSH-CyberWorkStation/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [xhvdhczd/dsh-plugin-marketplace](https://github.com/xhvdhczd/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/xhvdhczd/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [xrj/dsh-market-site](https://github.com/xrj/dsh-market-site) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/xrj/dsh-market-site/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [xxccdl/deepseek-harness-desktop](https://github.com/xxccdl/deepseek-harness-desktop) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/xxccdl/deepseek-harness-desktop/HEAD/README.md)；本地管理、更新或宿主界面项目；采用标准包契约，无单独上架格式。 |
| [dsh-marketplace](https://github.com/ydhrdh/dsh-marketplace) | ydhrdh JSON | [来源](https://raw.githubusercontent.com/ydhrdh/dsh-marketplace/HEAD/README.md)；生成上游 schema 合法条目，verified=false，保留 desktop/macOS 范围。 |
| [YELEBAI/dsh-plugin-marketplace](https://github.com/YELEBAI/dsh-plugin-marketplace) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/YELEBAI/dsh-plugin-marketplace/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [DSH Plugin Stars](https://github.com/ywsldxk/dsh-plugin-stars) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/ywsldxk/dsh-plugin-stars/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-plugin-workshop](https://github.com/yyyyukari/dsh-plugin-workshop) | 根组合包契约、GitHub topic、精确 npm 包 | [来源](https://raw.githubusercontent.com/yyyyukari/dsh-plugin-workshop/HEAD/README.md)；适配发现与包契约；未运行此市场安装器。 |
| [dsh-plugins-store](https://github.com/ZASENJC/dsh-plugins-store) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/ZASENJC/dsh-plugins-store/HEAD/README.md)；已读取来源说明，具备标准包与双语投稿元数据；目录人工选择和运行验证独立。 |
| [dsh-web#packages/dsh-plugin-manager](https://github.com/zhu1090093659/dsh-web/tree/main/packages/dsh-plugin-manager) | 根组合包契约、精确 npm 包、本地 tgz | [来源](https://raw.githubusercontent.com/zhu1090093659/dsh-web/HEAD/packages/dsh-plugin-manager/README.md)；管理已安装插件或更新，不要求单独市场投稿；宿主契约已具备。 |
| [zhuoxuanliu53-svg/dsh-plugin-market](https://github.com/zhuoxuanliu53-svg/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/zhuoxuanliu53-svg/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [zr-promise/dsh-plugin-market](https://github.com/zr-promise/dsh-plugin-market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://raw.githubusercontent.com/zr-promise/dsh-plugin-market/HEAD/README.md)；公开说明已读取；适配标准组合包、仓库/npm 发现与元数据；不扩大宿主版本或 Profile 声明，未运行该市场安装器。 |
| [dsh.so](https://www.dsh.so/) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://www.dsh.so/zh/submit/)；浏览器最终可正常读取提交页：DSH 信号、安装说明、SPDX 许可和源码扫描契约已具备；不伪造其安全扫描或 L1-L5 结论。 |
| [DSH Get](https://www.dshget.com/categories/market) | 根组合包契约、GitHub topic、精确 npm 包、通用投稿材料 | [来源](https://dshget.com/categories/market)；页面可读，公开 GitHub topic 发现入口可见；适配发现和标准包契约，不宣称站点审核通过。 |

## 不适用的专用市场或项目

| 项目 | 原因 |
|---|---|
| [1wanganshi/dsh-marketing-toolkit](https://github.com/1wanganshi/dsh-marketing-toolkit) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [2026heshao/dsh-armory](https://github.com/2026heshao/dsh-armory) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [AdamPlatin123/dsh-tonghuashun](https://github.com/AdamPlatin123/dsh-tonghuashun) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [AIcivilization/dsh-vps](https://github.com/AIcivilization/dsh-vps) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [AlgoVaultLabs/dsh-algovault](https://github.com/AlgoVaultLabs/dsh-algovault) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [AnacondaKC/dsh-stock-market](https://github.com/AnacondaKC/dsh-stock-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-mcp-lens](https://github.com/andrietteprotective835/dsh-mcp-lens) | 当前内容为 MCP 优化器或通用 API 目录，不是本 Provider 的发行市场。 |
| [awesome-deepseek-harness](https://github.com/anil-matcha/awesome-deepseek-harness) | 当前内容为 MCP 优化器或通用 API 目录，不是本 Provider 的发行市场。 |
| [ApakohZzz/DSHPluginHub-Market-Framework](https://github.com/ApakohZzz/DSHPluginHub-Market-Framework) | 自包含源码分发模板；不接受 npm/外部仓库目录目标，不能将本插件的独立发布包伪装成其内嵌插件。 |
| [ben7am1n/dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [cogine-ai/marketplace](https://github.com/cogine-ai/marketplace) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-skills-marketplace](https://github.com/cxdyun/dsh-skills-marketplace) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [dakeqiqi123/dsh-skill-market](https://github.com/dakeqiqi123/dsh-skill-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-agent-plugin-market](https://github.com/Diluka/dsh-agent-plugin-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [dmsobtl/dsh-tool-market-data](https://github.com/dmsobtl/dsh-tool-market-data) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [FeiZhuNiU-INFJA/dsh-stock-ticker](https://github.com/FeiZhuNiU-INFJA/dsh-stock-ticker) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [FitBBC/dsh-plugin-tokenmarket](https://github.com/FitBBC/dsh-plugin-tokenmarket) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [hancao97/hanai-investment-dsh](https://github.com/hancao97/hanai-investment-dsh) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-cli-store](https://github.com/Harzva/dsh-cli-store) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [Imzl-zl/dsh-toolbox-ui](https://github.com/Imzl-zl/dsh-toolbox-ui) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [JohnXu22786/market-watch](https://github.com/JohnXu22786/market-watch) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [kaiwu/sparkles](https://github.com/kaiwu/sparkles) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [KCNyu/clawock](https://github.com/KCNyu/clawock) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [keman-ai/dsh-skin-market](https://github.com/keman-ai/dsh-skin-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-skin-market](https://github.com/kingOfSoySauce/dsh-skin-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [dsh-theme-switch](https://github.com/kinmat-A/dsh-theme-switch) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [kobenfang/BigPlan](https://github.com/kobenfang/BigPlan) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [kongyecn-wq/dsh-okx-skill-hub](https://github.com/kongyecn-wq/dsh-okx-skill-hub) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-vibe-pack](https://github.com/LeemanCheung/dsh-vibe-pack) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [LeonxLJX/dsh-mcp-market](https://github.com/LeonxLJX/dsh-mcp-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-mcp-market](https://github.com/LKMeng2001/dsh-mcp-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [looput/dsh-finance-lab](https://github.com/looput/dsh-finance-lab) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [LUMOGRESS/dsh-skill-navigator](https://github.com/LUMOGRESS/dsh-skill-navigator) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [maddogfinance/dsh-trading](https://github.com/maddogfinance/dsh-trading) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-stock-mentions](https://github.com/mingzeng21/dsh-stock-mentions) | 股票提及功能，虽在 market 分类中但不是插件发行市场。 |
| [montersy123/dsh-skill-market](https://github.com/montersy123/dsh-skill-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-mcp-market](https://github.com/Mrxieyong/dsh-mcp-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [muen-collective/muen-plugins](https://github.com/muen-collective/muen-plugins) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [NattoCB/dsh-plugin-petdex-market](https://github.com/NattoCB/dsh-plugin-petdex-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [NattoCB/dsh-widget-center](https://github.com/NattoCB/dsh-widget-center) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [Niceck/dsh-hhxg-market](https://github.com/Niceck/dsh-hhxg-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [omdsh-dev/dsh-longbridge](https://github.com/omdsh-dev/dsh-longbridge) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-employee](https://github.com/open-dshai/dsh-employee) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [pbwheel/dsh-agency-market](https://github.com/pbwheel/dsh-agency-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [peiqi10086/dsh-skills-market](https://github.com/peiqi10086/dsh-skills-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [PerryLink/dsh-catalog](https://github.com/PerryLink/dsh-catalog) | PerryLink 作者家族专用目录；不把他人专属目录当作通用投稿渠道。 |
| [PerryLink/perrylink](https://github.com/PerryLink/perrylink) | PerryLink 作者家族专用目录；不把他人专属目录当作通用投稿渠道。 |
| [phoenixlucky/business-data-analyst-skill](https://github.com/phoenixlucky/business-data-analyst-skill) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-skill-market](https://github.com/pn1024/dsh-skill-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [potoior/dsh-bull-bear](https://github.com/potoior/dsh-bull-bear) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [pwangxo-sg/financial-market-analysis](https://github.com/pwangxo-sg/financial-market-analysis) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [QinpanWan/dsh-harmonyos-market](https://github.com/QinpanWan/dsh-harmonyos-market) | 仅接纳 HarmonyOS 已验证插件；本项目当前只声明已验证的 macOS desktop，不虚构鸿蒙兼容。 |
| [QQ-M/dsh-skill-market](https://github.com/QQ-M/dsh-skill-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-agent-plugins-market](https://github.com/Sivan757/dsh-agent-plugins-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [stvlynn/dsh-dify-marketplace](https://github.com/stvlynn/dsh-dify-marketplace) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [theBigGavin/marketingdashboard](https://github.com/theBigGavin/marketingdashboard) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [tianyagk/dsh-tradewatcher](https://github.com/tianyagk/dsh-tradewatcher) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [universal-plugin-hub](https://github.com/Ultmebius/universal-plugin-hub) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [V-dev-388/DSH-plugin-market](https://github.com/V-dev-388/DSH-plugin-market) | 自定义静态/动态单文件下载协议，需修改 DSH 核心；不等同当前标准 Cordis bundle 安装契约。 |
| [Vladimir-Human/ru-marketplace-mcp](https://github.com/Vladimir-Human/ru-marketplace-mcp) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [plugin-registry](https://github.com/vlln/plugin-registry) | README 已声明 2026-10-03 归档停止维护，原生插件页已替代。 |
| [Weaxs/stock-analysis-plugin](https://github.com/Weaxs/stock-analysis-plugin) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [experts-management](https://github.com/weibaohui/experts-management) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [weopenfire-git/dsh-market-quote](https://github.com/weopenfire-git/dsh-market-quote) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [wzn16/dsh-skill-market](https://github.com/wzn16/dsh-skill-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [xcasee/dsh-plugin-market-intelligence](https://github.com/xcasee/dsh-plugin-market-intelligence) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [dsh-expert-market](https://github.com/yangyizhu8/dsh-expert-market) | 面向技能、主题、MCP、专家或其他资源形态，不作为本模型 Provider 的发行渠道。 |
| [yi-yezhiqiu/dsh-prompt-market](https://github.com/yi-yezhiqiu/dsh-prompt-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [zhiyaoli0221/dsh-finance-db](https://github.com/zhiyaoli0221/dsh-finance-db) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [zhu1090093659/dsh-skins](https://github.com/zhu1090093659/dsh-skins) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [ZiFan1117/dsh-atom-market](https://github.com/ZiFan1117/dsh-atom-market) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |
| [zzhi191/dsh-plugin-night-dog](https://github.com/zzhi191/dsh-plugin-night-dog) | 股票/营销等非插件市场，或技能、主题、MCP、提示词、专属作者目录等资源形态；不作为本 Provider 发行渠道。 |

## 按用户要求跳过

- [DeepSeek Code 插件列表](https://deepseek-code.com/plugins)：导航中的旧网站线索，当前未取得可核对规范；按用户要求跳过。
- [dsh-plugin.net](https://dsh-plugin.net/submit)：旧台账或 README 线索，当前规则未取得；按用户新范围不计入已适配市场。
- [DSH 一站式插件发现](https://dsh.cooljser.com)：导航中的旧网站线索，当前未取得可核对规范；按用户要求跳过。
- [岚叔目录](https://dsh.lanshuagent.com/)：公开数据请求失败或超时；按用户指示跳过。
- [dsh.works](https://dsh.works/)：公开数据请求失败或超时；按用户指示跳过。
- [dshmp](https://dshmp.com/en/guides/publishing/publish-a-plugin)：旧台账或 README 线索，当前规则未取得；按用户新范围不计入已适配市场。
- [dshplugin.market](https://dshplugin.market/)：公开数据请求失败或超时；按用户指示跳过。
- [dshpluginstore](https://dshpluginstore.com/submit)：旧台账或 README 线索，当前规则未取得；按用户新范围不计入已适配市场。
- [ybkk-AIOS](https://github.com/01men/ybkk-AIOS)：访问失败，按用户指示跳过。
- [DSH-Desktop/dsh-plugin-marketplace](https://github.com/DSH-Desktop/dsh-plugin-marketplace)：访问失败，按用户指示跳过。
- [Awesome DeepSeek Harness](https://github.com/fendouai/awesome-deepseek-harness)：README 超出审计大小限制；按用户要求跳过，不影响其他目录。
- [losebird/dsh-plugin-market](https://github.com/losebird/dsh-plugin-market)：公开说明读取失败，按用户要求跳过。
- [dsh-subscribe#plugin](https://github.com/zoahdev/dsh-subscribe/tree/main/plugin)：访问失败，按用户指示跳过。
- [DSHHub.co](https://www.dshhub.co/)：公开数据请求失败或超时；按用户指示跳过。
- [dshplugin.io](https://www.dshplugin.io/zh)：旧台账或 README 线索，当前规则未取得；按用户新范围不计入已适配市场。
- [DSH Bundle 目录](https://www.xxnmkk.xyz)：导航中的旧网站线索，当前未取得可核对规范；按用户要求跳过。

## 维护与验证

运行 `npm run market:audit` 刷新目录及公开说明的只读审计，日志保存在 outputs/market，不安装或执行市场代码；信号提取不自动赋予兼容或审核结论。人工核对新规则后更新 market/coverage.json，再运行 `npm run market:report`。

运行 `npm run market:build`、`npm run market:check` 和 `npm run market:prepare -- --repository https://github.com/diwer/dsh-codex-adapter` 生成并验证材料。发布源码或版本改变后，固定源码证据与市场安装验证需重新取得。提交、审核、收录、搜索命中与安装通过继续分别记录。
