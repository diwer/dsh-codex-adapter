# 插件市场 icon 使用

核对日期：2026-10-16。项目 icon 为包内 `lib/assets/big-fish-codex.png`，与桌面插件及文档使用同一图片，未替换作者账号头像。

[直接查看 icon](https://raw.githubusercontent.com/diwer/dsh-codex-adapter/b635f282840042560891a6a10317e75d12e29a90/lib/assets/big-fish-codex.png)。`market/icon.json` 记录固定源码地址、PNG 类型、尺寸、字节数、SHA-256 与中英文替代文本。`npm run market:check` 校验其与包内文件一致。

| 渠道 | 实际接入方式 | 核对依据 |
| --- | --- | --- |
| 作者目录 / 官网 | 作者目录已有 icon 字段；通用投稿材料补充公开图片与替代文本 | [作者目录](https://diwer.github.io/dsh-codex-adapter/market/plugins.json) |
| awesome 社区 | YAML 不添加未支持字段；原 PR 说明展示图片 | [投稿规范](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) |
| 1024 Store | schema 不允许 icon 字段；保留仓库/npm 身份，通过 README 提供图片 | [schema](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/catalog/schema/plugin.schema.json) |
| ydhrdh | 详情页使用分类图标，未发现插件图片渲染；PR 说明展示项目图片 | [详情组件](https://github.com/ydhrdh/dsh-marketplace/blob/main/web/src/components/PluginDetail.jsx) |
| dsh-plugins | 既有聚合格式没有已确认的 icon 接口；原 PR 说明展示图片 | [聚合器](https://github.com/dsh-plugins/dsh-plugin-market/blob/main/scripts/aggregate.mjs) |
| cyber-moshen / 216 | 保留客户端自身 UI 图标；原 PR 说明提供项目图片 | [cyber 客户端](https://github.com/cyber-moshen/dsh-plugin-market/blob/main/lib/client.js)、[216 客户端](https://github.com/2160039878-cyber/dsh-plugin-market/blob/main/lib/client.js) |
| 其余收录申请 | 原 Issue 附图片和直接 URL，维护者按实际能力展示 | [投稿回执](MARKET_SUBMISSION_STATUS.md) |

使用公开 HTTPS 图片地址，不使用登录后才能访问的宿主 `/api/dsh-chatgpt-plan/icon`、本机路径、GitHub blob 页面或临时 data URL。目录若使用作者 GitHub 头像，不宣称插件自定义 icon 已生效，也不修改作者账号头像。图片随 npm 包分发；上游图片审核和缓存刷新另行确认。
