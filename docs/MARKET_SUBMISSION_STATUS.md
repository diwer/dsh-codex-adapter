# 市场投稿回执

核对时间：2026-10-15，北京时间。投稿、上游合并和市场上线分别记录；没有把格式适配视为市场认证。

## v0.1.3 最新版本同步

- [npm v0.1.3](https://www.npmjs.com/package/dsh-codex-official-adapter/v/0.1.3) 与 [GitHub Release v0.1.3](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.3) 均可下载，安装包 SHA-256 一致：`42c7b7ff85315a088de97b52113ab9fb15a2e21850c54fde8fd0b5bb0a3c7caa`。
- 19 个运行文件与发布源码 `2e9935ba8f7879961b1c4c38214cfc1aba629e7f` 一致；固定源码市场材料已按该版本重新核验、生成。
- 原有 6 个作者可维护 PR 均更新为 v0.1.3；6 个收录 Issue 的安装与发布说明已更新。未把待审更新视为已经上线。
- ydhrdh 的安装目标已从旧源码切为 npm `dsh-codex-official-adapter@0.1.3`；awesome 更新 tarball；Radar 更新登记行；216 更新固定 commit。
- dsh-plugins、cyber-moshen、1024 的记录没有独立版本字段，保持其仓库/npm 身份和 schema，通过源仓库或 npm latest 获取版本，不添加上游不支持的字段。1024 是否已刷新网页缓存尚未独立确认。
- Ericwong 的原 Issue 编辑后，自动 intake 已刷新原 PR 的源码记录，未新建重复 PR。
- dsh.pub 已合并记录只允许 `schemaVersion` 与 `repository`，不允许覆盖既有坐标；已在[原 PR 请求刷新](https://github.com/dsh-pub/dsh-pub/pull/137#issuecomment-6190135871)，待其同步，未声称该站已显示 v0.1.3。
- dsh.so 按 npm v0.1.3 扫描与格式校验通过，但提交服务返回“尚未配置——请联系 dsh.so 维护者”，未取得新版成功回执；其公开投稿追踪仓库也返回 404。用户确认无替代入口，按异常渠道保留阻塞记录，不能视为更新完成。
- 定时任务改为每次读取 npm latest 与真实 Release 后跟进当前版本，不固定旧版。

## v0.1.2 历史发布核验

- CLI 登录成功；npm 官方源 `dsh-codex-official-adapter@0.1.2` 可下载，未重复发布。
- [npm v0.1.2](https://www.npmjs.com/package/dsh-codex-official-adapter/v/0.1.2) 与 [GitHub Release](https://github.com/diwer/dsh-codex-adapter/releases/tag/v0.1.2) 的包 SHA-256 一致：`52a303182f481ad1f11f3735016d116485638062c9ad3f6b4bd9af4ce0e1ecc5`。

## PR

| 市场 | 回执 | 当前状态 |
| --- | --- | --- |
| awesome-dsh-plugin/awesome-dsh-plugin | [投稿](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/7463) | 草稿，待仓库满一天 |
| imsai-sh/awesome-deepseek-harness-plugins | [投稿](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/pull/608) | 已合并 |
| ydhrdh/dsh-marketplace | [投稿](https://github.com/ydhrdh/dsh-marketplace/pull/16) | 待上游审核 |
| dsh-plugins/dsh-plugin-market | [投稿](https://github.com/dsh-plugins/dsh-plugin-market/pull/2) | 待上游审核 |
| cyber-moshen/dsh-plugin-market | [投稿](https://github.com/cyber-moshen/dsh-plugin-market/pull/2) | 待上游审核 |
| AdamPlatin123/dsh-plugin-radar | [投稿](https://github.com/AdamPlatin123/dsh-plugin-radar/pull/954) | 待上游审核 |
| 2160039878-cyber/dsh-plugin-market | [投稿](https://github.com/2160039878-cyber/dsh-plugin-market/pull/1) | 待上游审核 |
| dsh.pub | [投稿](https://github.com/dsh-pub/dsh-pub/pull/137) | 已合并 |
| Ericwong5021/deepseek-plugin-store | [自动生成 PR](https://github.com/Ericwong5021/deepseek-plugin-store/pull/300) | 录入检查通过，待 PR 审核 |

## Issue 与网页

| 市场 | 回执 | 当前状态 |
| --- | --- | --- |
| alexchenzl/dsh-plugin-directory | [申请](https://github.com/alexchenzl/dsh-plugin-directory/issues/350) | 已提交，标签：plugin-submission |
| ylwl1997/dshbase | [申请](https://github.com/ylwl1997/dshbase/issues/152) | 已提交，待维护者分流/审核 |
| 2BingLing/dsh-market | [申请](https://github.com/2BingLing/dsh-market/issues/247) | 已提交，标签：submission |
| whyihaveyou/dsh-suite | [申请](https://github.com/whyihaveyou/dsh-suite/issues/63) | 已提交，待维护者分流/审核 |
| Ericwong5021/deepseek-plugin-store | [申请](https://github.com/Ericwong5021/deepseek-plugin-store/issues/299) | 已提交，标签：type:submission, gov:approved, gov:pr-open |
| vvlife/whalehub-dsh | [申请](https://github.com/vvlife/whalehub-dsh/issues/86) | 已提交，待维护者分流/审核 |
| dsh.so | [投稿入口](https://www.dsh.so/zh/submit/) | 页面返回“提交成功”，待市场审核 |

## 后续检查

- 定时任务 `dsh`：每天北京时间 15:20；首次 2026-10-16。仅在实质进展、明确失败或需要用户操作时通知，全部完成后停止。
- awesome 仓库满一天门槛：2026-10-16 15:16:05；届时核验当前准入条件，再将草稿转为正式投稿。
- 自动任务同时读取 `outputs/market/submissions/github-receipts.json`、`issue-receipts.json`、`web-receipts.json` 与本文件，避免重复投稿。
- 一些目录标签由上游机器人/维护者管理；无权限添加时保留现有 Issue，不重复建单、不扩权。
- 本轮未执行第三方市场安装、未宣称独立运行认证；只记录真实投稿结果。

## 验证

- `npm run test:protocol`：True，退出码 0。
- `npm run verify`：True，退出码 0。
- 日志：`outputs/test-reports/market-submissions-final-*.log`。
