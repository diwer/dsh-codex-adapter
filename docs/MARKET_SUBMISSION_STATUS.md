# 市场投稿回执

核对时间：2026-10-15，北京时间。投稿、上游合并和市场上线分别记录；没有把格式适配视为市场认证。

## npm

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
