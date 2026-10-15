# 市场安装与使用验收（2026-10-15）

## dshmarket 1.66.21

通过桌面应用自带的官方 CLI，在独立验收 Home 的 `market-ui` Web Profile 安装 dshmarket 1.66.21，宿主为 0.2.0-rc.2。既有桌面 Profile、插件和用户会话保持。这里使用桌面自带运行时启动独立 Web UI，不等同于改写原桌面 Profile。

### 默认公共目录

实际加载 4671 条公共记录，在 UI 搜索插件名称；没有本插件卡片。公共源是 awesome-dsh-plugin，要求仓库创建满 1 天并通过审核，因此不把作者目录当作默认公共市场已收录。

### 作者目录安装链路

使用市场官方支持的 `DSHM_REGISTRY_URL` 配置选择[作者公开目录](https://diwer.github.io/dsh-codex-adapter/market/plugins.json)。该目录只有本作者的插件，明确不是社区精选目录。

在市场 UI 点击“安装 → 确认安装”，由市场调用官方 CLI 下载 v0.1.0 Release tgz、安装依赖、登记 bundle。UI 显示“已安装”，刷新后出现“ChatGPT 订阅”入口。安装源确认为本仓库的[固定版本 tgz](https://github.com/diwer/dsh-codex-adapter/releases/download/v0.1.0/dsh-codex-official-adapter-0.1.0.tgz)，已安装的 17 个运行文件与发行包逐字节一致。

独立 CLI 启动环境需要能找到桌面自带的 `dsh` 命令；验收环境补齐 PATH 后完成安装，没有修改第三方安装器或绕过目录校验。

### 真实模型和工具

从 UI 选择 GPT-6.1-Sol，实际调用读取、编辑及回读工具。独立验收文件 `count=1` 变为 `count=2`，随机 marker 完整保留，磁盘结果核对通过；模型最终返回 `MARKET_GPT_TOOLS_OK`。跨工作区写入由宿主审批，仅批准指定文件的一次编辑，未全局扩大权限。使用本插件已有的独立授权，不复制其他客户端凭证。

本次不包含所有 GPT 型号、图片复测、DeepSeek 实际请求或长会话压缩，不用历史通过记录替代本次验收。

## Scorp1o117/dsh-plugin-marketplace 0.5.2

在另一独立 Profile `market-scorpio` 实际安装并打开其配置 UI。公共 GitHub 搜索能够找到 `diwer/dsh-codex-adapter`，说明此市场的发现入口已经能检索本仓库。

实际发现安装器限制：

- 管理入口只接收 npm 包名，拒绝 `github:` source。
- 仓库详情的“一键安装”从仓库名推导出 `dsh-codex-adapter`，并非实际包名 `dsh-codex-official-adapter`。
- 本插件尚未发布 npm。没有点击或安装错误推导的同名包，没有把“能搜索”报告为“能一键安装”。

已对实际安装的 `performOperation` / `PACKAGE_NAME` 执行契约检查：GitHub source 在调用任何安装子进程前被拒绝。此渠道仍需 npm 发布身份，以及上游读取真实包清单、正确解析仓库安装源的兼容修正。仅增加 README 关键词无法修复第三方安装器的错误推导。

## @1e0zj/dsh-plugin-mall 0.4.17

已在独立 `market-mall` Profile 安装，宿主组件显示运行中。其客户端仍注册旧 `settings.plugins.tab`，当前 rc.2 设置页及插件详情中未出现市场入口；自带 guard CLI 也拒绝识别桌面应用自带的 dsh shim。未绕过 guard，未声称本 Provider 已通过该市场安装。该实例说明 peer 声明匹配并不等于桌面界面或安装器可用。

## 远程安装错误的补充

之后在测试桌面发现 GitHub Release URL 安装报缺少 integrity；独立市场 Profile 的成功不适用于该路径。仓库提供先验证固定 SHA-256、再由官方 CLI 安装本地包的辅助脚本。测试桌面的本地安装已成功，保留既有依赖与 bundle；其 GUI 重启后加载尚未确认。详见[安装故障](INSTALLATION.md)。

## 公共目录及 AI 文档

已通过 dsh.pub 提交页提交，自动创建的[收录申请 #137](https://github.com/dsh-pub/dsh-pub/pull/137)检查通过并合并。线上列表的实际可搜索状态另行核对，不仅凭 PR 合并宣称搜索完成。

[公开文档](https://diwer.github.io/dsh-codex-adapter/)、llms.txt、llms-full.txt、Sitemap 和作者目录均已验证 HTTP 200，结构化数据中的版本与下载地址一致。GitHub topic 搜索也能找到本仓库。通用搜索引擎的精确查询本轮尚无结果，不声称 AI 搜索服务已索引或引用。

## 全量范围

已知 81 条市场与管理记录、79 份可读取清单，逐项的宿主版本声明和剩余条件见[已知市场台账](KNOWN_MARKETS.md)。声明匹配、市场组件可启动、公共搜索命中、插件安装、真实模型使用分别计证。未安装和未核实的市场保持未验证；不把单个市场的成功外推为全部市场都已验收。
