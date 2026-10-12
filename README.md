# dsh划词评论

**主检索关键词：`dsh划词评论`**

**机器检索别名 / 插件包名：`dsh-huaci-pinglun`**

选中文字 → 写评论或添加到对话 → 引用以胶囊放进输入框。插件不会替你发送消息。

> 本项目是 [BangBang-03/dsh-client-ui-quote](https://github.com/BangBang-03/dsh-client-ui-quote) **0.11.1 的 MIT 修补分支**，不是重新原创的同类插件。主要功能由上游实现；本分支由 BaoBao1996121 维护引用框布局修复、独立发布标识和浏览器回归测试。完整来源见 [UPSTREAM.md](./UPSTREAM.md)，原版权与许可保留在 [LICENSE](./LICENSE)。

## 能做什么

- 在会话正文、文件预览或终端选中文字，浮出「评论 / 添加到对话」。
- 引用正文和评论各占一个输入框，可以裁剪引用或补充问题。
- 「评论」需要引用与评论均非空；「添加到对话」可直接引用。
- 引用和评论合成一个胶囊，加入当前会话草稿；发送仍由你操作。
- 多行引用自动增高，长引用达到高度上限后可以滚动，不再被压扁裁字。
- 保留上游的引用清单、跳回原文、引用修订、逐条回应等功能。
- 安装并启用 `dsh-better-sidebar` 后，才有可选的侧边对话；基础划词评论不要求该插件。

## 安装

适用 DSH Web / 桌面 UI。修复基线在 **DSH 0.2.0-rc.2** 验证过；其他版本请先确认兼容性。headless profile 不显示浮层。

**本项目是原版的替代分支，不要与 `dsh-client-ui-quote` 同时启用。** 两者保留相同的引用格式、引用序列化来源和本地记录键，便于替换时继续使用已有引用。

### GitHub Release 安装包

下载 [v0.1.0 的预构建安装包](https://github.com/BaoBao1996121/dsh-huaci-pinglun/releases/tag/v0.1.0)，然后安装本地 `.tgz`：

```bash
dsh plugin --profile desktop add file:/absolute/path/dsh-huaci-pinglun-0.1.0.tgz
```

Windows 示例：

```powershell
dsh plugin --profile desktop add file:C:/Downloads/dsh-huaci-pinglun-0.1.0.tgz
```

或安装固定 GitHub 版本：

```bash
dsh plugin --profile desktop add github:BaoBao1996121/dsh-huaci-pinglun#v0.1.0
```

安装后请保存草稿，**完整退出并重开 DSH**。同名插件换包时，单纯刷新页面可能继续使用宿主缓存。

在「插件」页查找 **dsh划词评论** 并启用。已有原版用户请先停用原版，再启用本分支；需要时可卸载旧包。

本版本通过 GitHub Release 分发，**不宣称已经发布到 npm**。

## 使用

1. 在会话正文中拖选一句话。
2. 选「评论」，填写评论，再点「添加到对话」；或直接选「添加到对话」。
3. 在输入框确认引用内容，补充问题后自己发送。

快捷键继承上游：`Alt+Q` 引用、`Alt+C` 评论、`Alt+B` 侧边对话、`Alt+L` 引用清单。可用项取决于宿主服务与可选侧边栏插件。

## 修补范围与验证边界

- 将引用框的高度测量移到 DOM 挂载且可布局之后，避免 `scrollHeight = 0`。
- 将边框计入高度，长文本达到 160px 上限后允许滚动。
- 初始评论正文也按实际内容增高。
- 本分支使用独立包名、模块标识、插件条目和快捷键命名；保留旧引用的传输格式与本地记录键。

基础布局修复在真实 DSH GUI 中已由用户确认。独立发布标识另做离线注册/行为测试和隔离真实浏览器测试；这些不等于所有 DSH 版本、第三方插件组合都通过验收。

如果控制台出现 `cannot get property "remote.session" without inject`，先根据调用栈检查对应插件的依赖声明。我们遇到的实例来自独立的 `dsh-codex-fast-toggle`，该插件不包含在本发布包中，也不能通过修改引用框样式解决。

## 开发与测试

无需下载第三方测试依赖：

```bash
npm test
npm run test:browser
```

浏览器测试需要本机 Chrome / Chromium，可通过 `DSH_TEST_CHROME` 指定可执行文件。测试使用隔离浏览器配置，不登录账号、不访问真实会话、不调用模型。

## 宣传与市场状态

**搜「dsh划词评论」，选中文字就能评论或添加到对话。**

可复制主词：`dsh划词评论`；可复制别名：`dsh-huaci-pinglun`。

GitHub description、topics 和本 README 是检索入口。搜索引擎收录可能延迟；暂时搜不到时，可用英文别名或[仓库链接](https://github.com/BaoBao1996121/dsh-huaci-pinglun)定位。不保证搜索排名。

市场目录由独立维护者审核。提交收录 PR 不等于已经上架；只有合并并发布目录后才可在市场检索到。
