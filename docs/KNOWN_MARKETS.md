# 已知市场逐项适配台账

检查日期：2026-10-15。以下是 81 条市场与管理记录的逐项清单；其中包含本地管理器、技能/主题/MCP 专用商店及数据源，不都接收模型 Provider。

当前宿主 0.2.0-rc.2：声明匹配 22，声明不匹配 21，未知 38。这些状态只比较清单声明，不能作为实际安装或功能验收。

已统一提供真实 bundle、构建好的入口、peerDependencies、中英文 Provider 分类、disclosure、GitHub topics，以及固定版本 Release 安装包。

| 市场仓库 | 清单版本 | 宿主声明检查 | 数据源信号 | 具体剩余事项 |
|---|---|---|---|---|
| [01men/ybkk-AIOS](https://github.com/01men/ybkk-AIOS) | 不可读 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [1e0zj/dsh-plugin-mall](https://github.com/1e0zj/dsh-plugin-mall) | 0.4.17 | compatible | github-topic | GitHub topics 和标准 bundle 已提供；组件已装入独立 Profile 并运行；旧设置入口和桌面 CLI 识别阻塞仍待上游修复 |
| [2768651338/dsh-plugin-manager](https://github.com/2768651338/dsh-plugin-manager) | 0.8.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [863683348/dsh-feed](https://github.com/863683348/dsh-feed) | 0.1.0 | incompatible | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-insight](https://github.com/863683348/dsh-insight) | 0.1.0 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-need-finder](https://github.com/863683348/dsh-need-finder) | 0.3.2 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-plugin-audit](https://github.com/863683348/dsh-plugin-audit) | 0.5.2 | incompatible | github-topic, awesome-community-registry | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；社区条目已准备；等待仓库满 1 天后提交及维护者审核；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-plugin-recommend](https://github.com/863683348/dsh-plugin-recommend) | 1.1.2 | incompatible | awesome-community-registry | 社区条目已准备；等待仓库满 1 天后提交及维护者审核；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-plugin-scorecard](https://github.com/863683348/dsh-plugin-scorecard) | 0.3.2 | incompatible | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [863683348/dsh-recipe](https://github.com/863683348/dsh-recipe) | 0.1.0 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [99galaxy/dsh-plugin-market](https://github.com/99galaxy/dsh-plugin-market) | 1.1.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [alex04130/dsh-forge](https://github.com/alex04130/dsh-forge) | 0.2.0-preview.1 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [AlexYin-Tongji/dsh-plugin-console](https://github.com/AlexYin-Tongji/dsh-plugin-console) | 0.3.2 | incompatible | awesome-community-registry | 社区条目已准备；等待仓库满 1 天后提交及维护者审核；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [awesome-dsh-plugin/dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) | 0.4.0 | incompatible | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [azure5100/huahua-dsh-plugin-orchestra](https://github.com/azure5100/huahua-dsh-plugin-orchestra) | 0.1.0 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [beartackler/dsh-bridge](https://github.com/beartackler/dsh-bridge) | 0.1.0 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [bradeGithub/DSH-Plugins-Marketplace](https://github.com/bradeGithub/DSH-Plugins-Marketplace) | 1.7.1 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [buhuikongpan/dsh-pluginmanager](https://github.com/buhuikongpan/dsh-pluginmanager) | 0.2.0 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [ChengxiuCDP/dsh-plugin-advisor](https://github.com/ChengxiuCDP/dsh-plugin-advisor) | 0.1.1 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [CREAIT-nl/dsh-plugins](https://github.com/CREAIT-nl/dsh-plugins/tree/main/to-english) | 0.1.0 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [crTnT/dsh-plugin-suite](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-center) | 0.1.0 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [crTnT/dsh-plugin-suite](https://github.com/crTnT/dsh-plugin-suite/tree/main/dsh-plugin-updater) | 0.1.0 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [cxdyun/dsh-skills-marketplace](https://github.com/cxdyun/dsh-skills-marketplace) | 1.1.2 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [cynch18/plugin-switch](https://github.com/cynch18/plugin-switch) | 0.5.2 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Dariandai/dsh-starter-pack](https://github.com/Dariandai/dsh-starter-pack) | 0.1.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Diluka/dsh-agent-plugin-market](https://github.com/Diluka/dsh-agent-plugin-market) | 0.10.2-dsh.0.2.0-rc.2 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) | 1.66.21 | compatible | awesome-community-registry | 作者目录的市场 UI 安装和真实 GPT 文件工具验证通过；默认社区源仍待仓库年龄及审核条件 |
| [dsh-research/dsh-research](https://github.com/dsh-research/dsh-research) | 0.4.3 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [dshhub-co/dshhub-market](https://github.com/dshhub-co/dshhub-market) | 0.8.60 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [DshMarketPlace/dsh-plugins-store](https://github.com/DshMarketPlace/dsh-plugins-store) | 0.2.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Dylan37670/dsh-plugin-panel](https://github.com/Dylan37670/dsh-plugin-panel) | 0.6.17 | unknown | github-topic, awesome-community-registry | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；社区条目已准备；等待仓库满 1 天后提交及维护者审核 |
| [Eray114514/dsh-find-plugins](https://github.com/Eray114514/dsh-find-plugins) | 0.2.10 | compatible | github-topic, npm-keywords, dsh.so, dsh.works | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；npm keywords 已适配；尚未发布 npm |
| [f-infinite-z/dsh-plugin-ops](https://github.com/f-infinite-z/dsh-plugin-ops/tree/main/packages/bundle) | 0.20.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Harzva/dsh-cli-store](https://github.com/Harzva/dsh-cli-store) | 0.3.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [hoyyang/dsh-mall](https://github.com/hoyyang/dsh-mall) | 1.8.6 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [huguangyu666/dsh-store](https://github.com/huguangyu666/dsh-store) | 0.5.3 | unknown | github-topic, awesome-community-registry, npm-keywords | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；社区条目已准备；等待仓库满 1 天后提交及维护者审核；npm keywords 已适配；尚未发布 npm |
| [icefall7/dsh-plugin-scout](https://github.com/icefall7/dsh-plugin-scout) | 0.1.0 | compatible | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [JazzuLu/find-dsh-plugins](https://github.com/JazzuLu/find-dsh-plugins) | 0.1.0 | unknown | github-topic, dsh.so | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [Jesse-njx/dsh-plugin-manager](https://github.com/Jesse-njx/dsh-plugin-manager/tree/main/packages/cli) | 0.1.0 | incompatible | awesome-community-registry | 社区条目已准备；等待仓库满 1 天后提交及维护者审核；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [jiang4wqy/dsh-dejaview](https://github.com/jiang4wqy/dsh-dejaview) | 0.1.0 | compatible | github-topic, awesome-community-registry | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；社区条目已准备；等待仓库满 1 天后提交及维护者审核 |
| [jing-hy/dsh-unified-market](https://github.com/jing-hy/dsh-unified-market) | 0.4.1 | unknown | github-topic, npm-keywords | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；npm keywords 已适配；尚未发布 npm |
| [kimiya1010/dsh-plugin-market](https://github.com/kimiya1010/dsh-plugin-market) | 0.1.0 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [kingOfSoySauce/dsh-skin-market](https://github.com/kingOfSoySauce/dsh-skin-market) | 0.1.59 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [kinmat-A/dsh-theme-switch](https://github.com/kinmat-A/dsh-theme-switch) | 0.0.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [kkkkkklze/dsh-plugin-manager](https://github.com/kkkkkklze/dsh-plugin-manager) | 0.1.0 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [LeemanCheung/dsh-vibe-pack](https://github.com/LeemanCheung/dsh-vibe-pack) | 1.0.1 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [liqichen/dsh-plugin-manager](https://github.com/liqichen/dsh-plugin-manager) | 0.1.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [ljh257110/dsh-local-installer](https://github.com/ljh257110/dsh-local-installer) | 0.1.3 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [LKMeng2001/dsh-mcp-market](https://github.com/LKMeng2001/dsh-mcp-market) | 0.1.2 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [loguhan/dsh-workshop](https://github.com/loguhan/dsh-workshop) | 0.1.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [maryasov/dsh-plugins-hub](https://github.com/maryasov/dsh-plugins-hub) | 0.2.1 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Max-Null/dsh-plugin-center](https://github.com/Max-Null/dsh-plugin-center) | 0.4.6 | compatible | awesome-community-registry | 社区条目已准备；等待仓库满 1 天后提交及维护者审核 |
| [mingzeng21/dsh-stock-mentions](https://github.com/mingzeng21/dsh-stock-mentions) | 0.1.3 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [Mrxieyong/dsh-mcp-market](https://github.com/Mrxieyong/dsh-mcp-market) | 0.2.0 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [MS666666/dsh-archive-manager](https://github.com/MS666666/dsh-archive-manager) | 0.1.3 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [nanshan1995/DSH-Plugin-Market](https://github.com/nanshan1995/DSH-Plugin-Market) | 1.2.4 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [nonentity303/dsh-plugin-manager](https://github.com/nonentity303/dsh-plugin-manager) | 0.9.1-rc2 | incompatible | github-topic, awesome-community-registry, dshfind | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；社区条目已准备；等待仓库满 1 天后提交及维护者审核；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [open-dshai/dsh-employee](https://github.com/open-dshai/dsh-employee) | 0.1.0-rc.7 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Oscar-Williams/dsh-deepatlas](https://github.com/Oscar-Williams/dsh-deepatlas) | 0.2.3 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [oxlyn/dsh-plugin-mgr](https://github.com/oxlyn/dsh-plugin-mgr) | 0.2.11 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [PetCT/dsh-plugin-marketplace](https://github.com/PetCT/dsh-plugin-marketplace) | 1.0.0 | unknown | awesome-community-registry | 社区条目已准备；等待仓库满 1 天后提交及维护者审核 |
| [pn1024/dsh-skill-market](https://github.com/pn1024/dsh-skill-market) | 1.0.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [qinyre/dsh-plugin-install](https://github.com/qinyre/dsh-plugin-install) | 0.4.5 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Relistencode/dsh-extension-hub](https://github.com/Relistencode/dsh-extension-hub) | 0.2.19 | unknown | awesome-community-registry, dshfind | 社区条目已准备；等待仓库满 1 天后提交及维护者审核 |
| [sandbaseai/dsh-plugin-store](https://github.com/sandbaseai/dsh-plugin-store) | 0.1.0-preview.5 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [Sanqi-normal/dsh-webui-market-plugin](https://github.com/Sanqi-normal/dsh-webui-market-plugin) | 0.5.5 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [Scorp1o117/dsh-plugin-marketplace](https://github.com/Scorp1o117/dsh-plugin-marketplace) | 0.5.3 | compatible | github-topic | 0.5.2 组件已实装，公共搜索命中；详情页错误推导 npm 包名，未执行错误安装目标 |
| [Sivan757/dsh-agent-plugins-market](https://github.com/Sivan757/dsh-agent-plugins-market) | 0.9.2 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [springbrand-lab/dsh-plugin-market](https://github.com/springbrand-lab/dsh-plugin-market) | 1.0.8 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [stakeswky/awesome-dsh](https://github.com/stakeswky/awesome-dsh) | 0.1.0 | incompatible | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [tttwh/dsh-plugin-diraud](https://github.com/tttwh/dsh-plugin-diraud) | 0.9.2 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [tuogusa/dsh-plugin-toggle](https://github.com/tuogusa/dsh-plugin-toggle) | 0.3.0 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [Ultmebius/universal-plugin-hub](https://github.com/Ultmebius/universal-plugin-hub) | 1.0.26 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [vlln/plugin-registry](https://github.com/vlln/plugin-registry/tree/main/packages/plugin/console) | 0.1.0 | incompatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认；当前市场声明不支持 rc.2；不强行豁免宿主依赖 |
| [weibaohui/experts-management](https://github.com/weibaohui/experts-management) | 0.5.10 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [white-sand-grand/dsh-plugin-doctor](https://github.com/white-sand-grand/dsh-plugin-doctor) | 1.1.0 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [whyihaveyou/dsh-suite](https://github.com/whyihaveyou/dsh-suite/tree/main/packages/plugins/plugin-manager) | 0.8.7 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [yangyizhu8/dsh-expert-market](https://github.com/yangyizhu8/dsh-expert-market) | 1.0.0 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [yyyyukari/dsh-plugin-workshop](https://github.com/yyyyukari/dsh-plugin-workshop) | 1.6.2 | unknown | github-topic | GitHub topics 已设置；等待该市场索引，安装器尚未逐一验收 |
| [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web/tree/main/packages/dsh-plugin-manager) | 0.4.6 | compatible | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |
| [zoahdev/dsh-subscribe](https://github.com/zoahdev/dsh-subscribe/tree/main/plugin) | 不可读 | unknown | 待核实 | 标准 bundle 与 release 包已提供；此市场接入方式仍需单独确认 |

已完成的真实链路及具体阻塞见[市场实装与 GPT 工具验收](MARKET_RUNTIME_ACCEPTANCE.md)。

机器可读记录：[host-compatibility-2026-10-15.json](../market/host-compatibility-2026-10-15.json)。公共站点及目录入口另见[市场接入](MARKET_PUBLISHING.md)。

未对第三方安装器作未经验证的修改，不扩大宿主 peer 版本范围制造兼容，不把自有目录记录冒充第三方精选收录。
