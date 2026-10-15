# 市场适配与开源发布

核查日期：2026-10-15。GitHub 公开仓库及 v0.1.0 Release 已发布；npm 与第三方目录收录另行处理。完整[逐项市场台账](KNOWN_MARKETS.md)和[AI 搜索文档](AI_SEARCH.md)持续区分声明、提交、收录、实装和使用结果。

## 发现范围

已完整下载 [awesome-dsh-plugin 公共目录](https://awesome-dsh-plugin.com/plugins.json)，校验声明条数与实际数组条数一致：4671 条，其中 `market` 分类 81 条。源文件摘要、目录更新时间和全部 81 个仓库地址保存在 [发现快照](../market/discovery-2026-10-15.json)。该分类还含管理器、审核器和主题商店，不等于 81 个都接受模型 Provider；它也不代表互联网上所有目录。

逐项读取了这 81 条记录的 README，79 份可访问，2 份不可访问；[逐项来源覆盖表](../market/coverage-2026-10-15.json)保留每个仓库的数据源信号和未验证状态。24 份存在 GitHub topic 信号，12 份存在社区目录信号，3 份存在 npm 搜索信号，部分交叉；这些是 README 推断，不能替代实际安装和线上命中。其余含本地管理器、专用商店及尚需核实的入口。

刷新方式：`npm run market:discover`。网络不可用时可传 `--file 完整目录.json`；截断 JSON 或条数不一致会报错。发现命令只读取公开目录，不安装、执行或修改其他插件。

## 已完成的通用适配

- 标准根包、`dsh.bundle.patch`、真实服务端与客户端入口。发布包包含运行文件，无安装期构建脚本。
- npm 搜索关键词：`dsh-plugin`、`deepseek-harness`、ChatGPT/GPT/Codex 等；GitHub topics 在发布时设置，包内关键词不等于远程 topic。
- 中英文说明，`dsh.catalog.category=provider`，能力声明和 MIT 许可证。
- `dsh.compatibility` 严格限定 `0.2.0-rc.2`、`desktop`；宿主接口保留为 peer dependencies，不通过扩大版本范围制造兼容声明。
- 云端端点、OAuth 明文文件存储和权限披露；详见[数据与隐私](PRIVACY.md)。不伪造第三方 verified 标记。
- 独立的公开源码快照、安装包、SHA-256、提交字段和可复用本地检查。源文件不包含原始 `.git`、本机账户文件、会话记录、截图和内部运行日志。

## 各接入渠道

### 作者目录与公共目录

[作者提供的目录 JSON](https://diwer.github.io/dsh-codex-adapter/market/plugins.json)采用 dshmarket 支持的 catalog 格式，固定到本仓库的 v0.1.0 GitHub Release 安装包。独立验收可通过官方 `DSHM_REGISTRY_URL` 环境配置选择该目录；这是作者源，不是 awesome-dsh-plugin 社区精选目录，也没有第三方审核徽章。不能用自有源搜索命中冒充默认公共目录已收录。

公共社区目录要求仓库创建满 1 天；当前仓库创建于 2026-10-15 15:16:05（北京时间），最早 2026-10-16 15:16:05 达到这一项。达到年龄仍需提交及维护者审核，不保证自动收录。

下表记录真实文档明确的入口。共同清单适配已经完成，远端发布和索引同步仍需逐项完成。各站的默认 Web 安装命令不能证明本插件兼容旧 Web 宿主。

| 渠道 | 收录方式与剩余条件 | 规则依据 |
|---|---|---|
| GitHub topic 搜索型市场 | 公开仓库添加 `dsh-plugin`、`deepseek-harness`；等待各自索引 | [GitHub topic](https://github.com/topics/dsh-plugin) |
| npm 搜索型市场 | 发布本包及关键词；需要 npm 发布身份，包名可用性需发布时复核 | [dshmp 发布说明](https://dshmp.com/en/guides/publishing/publish-a-plugin) |
| awesome-dsh-plugin | `data/plugins/OWNER__REPO.yml` PR；分类 `model`；仓库须公开满 1 天并经维护者审核 | [贡献规则](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) |
| dshmarket / dshmarket.com | 消费上述社区清单；不是向市场程序仓库加条目 | [市场说明](https://github.com/dsh-market/dsh-market#submit-your-plugin) |
| DSH-Plugins-Marketplace | GitHub topic 抓取、根清单与入口识别；已提供 disclosure，凭证类型明确为 OAuth | [STANDARD](https://github.com/bradeGithub/DSH-Plugins-Marketplace/blob/main/STANDARD.md) |
| dsh-plugin-shop | GitHub topic 或 npm 关键词；已按 schema 填 `provider`、中英文摘要和能力 | [schema](https://github.com/LivXue/dsh-plugin-shop/blob/main/docs/schema.md) |
| dshmp.com | npm 日更抓取；仅 GitHub 公开不能满足该渠道 | [发布说明](https://dshmp.com/en/guides/publishing/publish-a-plugin) |
| dsh.pub | 提交公开仓库地址；检查根清单、patch、入口、README、许可证；产生固定 commit 的目录记录 | [提交入口](https://dsh.pub/zh/submit/) |
| DSH Hub | GitHub 登录后提交地址，或等待 topic 自动同步 | [发布入口](https://dsh-hub.cc/publish?lang=en) |
| dshmarketplace.dev | topic 抓取，亦有公开仓库检查与人工收录表单；精选目录另走 PR | [提交入口](https://dshmarketplace.dev/submit) |
| dshpluginstore.com | 提交仓库、简介、分类及兼容说明，人工审核 | [提交入口](https://dshpluginstore.com/submit) |
| dsh-plugin.net | topic 发现，公共仓库预检查；收录与运行验证分开 | [预检查入口](https://dsh-plugin.net/submit) |
| dshbase.com | GitHub topic 与社区数据聚合；需实际发布后验证搜索 | [目录与来源](https://dshbase.com/plugins/directory/) |
| dsh.market | 站点提供自动 GitHub 扫描及提交入口；需公开后复核实时提交流程 | [市场](https://dsh.market/) |
| dshplugin.io | 社区目录前端，有 GitHub 提交入口；需公开后复核其当前表单和目录格式 | [市场](https://www.dshplugin.io/zh) |
| DSH Get | 已找到市场管理分类，首页访问存在限制；不声称已验证提交接口 | [目录](https://www.dshget.com/categories/market) |
| 2160039878-cyber/dsh-plugin-market | topic 线索搜索可发现；进入内置精选清单需要维护者核验固定 commit | [目录规则](https://github.com/2160039878-cyber/dsh-plugin-market#registry) |
| ydhrdh/dsh-marketplace | 静态 `registry/plugins/<id>/plugin.json` 清单走维护者审阅；尚需公开后绑定固定源码身份 | [源码](https://github.com/ydhrdh/dsh-marketplace) |

81 条发现记录中，仅展示已安装插件的管理器不需要额外提交；技能、主题、MCP 专用商店不应伪装成可安装本 Provider 的渠道。尚未核实规则的市场保留为发现记录，不能声称已经兼容其安装器或完成上架。商业口令商店需要额外发布者与销售设置，不为免费插件编造收费或许可信息。

## 生成发布材料

```sh
npm run test:protocol
npm run verify
npm run market:check
npm run market:prepare
# 下面为格式示例；OWNER/REPOSITORY 需替换为实际仓库
npm run market:prepare -- --repository https://github.com/OWNER/REPOSITORY
```

`outputs/market/release-版本-时间/` 包含：

- `source/`：独立公开源码快照；保留开发测试与 CI，但不复制原始 Git 历史。
- `.tgz`：预构建安装包；`release.json` 记录文件范围和 SHA-256。
- `submission.json`：表单可用的简介、分类、兼容范围和 topics。
- 传入真实仓库后生成对应社区 YAML 条目，并设置快照中的 `repository`、`homepage`、`bugs`。当前工作树不会因此被改写，也不会自动联网提交。

没有传仓库地址时仍可完成本地打包，但明确标记发布身份缺失。传入地址只绑定元数据，不证明该仓库已存在或属于调用者。公开前应从 `source/` 建立新的 Git 历史；不要直接推送本地开发历史和内部验收材料。GitHub 应使用本人选择的公开身份，不沿用本机可能存在的公司邮箱。

## 上架后的验收标准

以每个站点实际搜索本包名、ChatGPT 和作者名的结果为准：核对源仓库、版本、安装目标、简介、许可证以及下载包校验和。分别记录“已提交”“待审核”“已收录”“可搜索”“安装成功”；不把其中任何一步替代另一项。搜索不到时先确认索引时间、仓库 topic、包名及宿主兼容过滤，再查看维护者拒绝原因。

## 本地验收（alpha.11）

2026-10-15：协议回归 88/88、完整测试 172/172、真实桌面运行时联调 7/7。已通过桌面应用自带 CLI 安装到独立验收 Home，组合配置包含本插件，并从已安装 tgz 挂载真实桌面 LLM/Cordis 服务：8 个路由注册、空账户模型列表、未登录状态查询、卸载后路由清除均通过。该阶段没有授权真实账户或发送新的推理请求，不代表市场远端安装、收录或搜索通过。开发中的内部验收日志保持在本地 outputs/，不进入公开源码快照。
