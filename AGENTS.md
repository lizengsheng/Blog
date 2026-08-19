# 项目协作约定

本仓库是李增圣的中文技术博客，基于 AstroPaper 构建并部署到 GitHub Pages 项目子路径 `/Blog/`。

## 开发约定

- 使用 pnpm 管理依赖，提交 `pnpm-lock.yaml`。
- 页面、导航、元数据和无障碍提示以简体中文为默认语言。
- 所有站内链接和静态资源必须兼容 Astro `base: "/Blog"`。
- 技术文章应区分事实、推断和待验证内容；不得虚构实验结果或项目经历。
- 修改后优先运行受影响范围的检查；涉及路由、配置或依赖时运行完整 lint、格式检查和构建。

## 重要提示

- 每个新的实施轮次首次写代码前，完整阅读 memory-bank/architecture.md 和 memory-bank/design-document.md
- 每完成一个功能批次或里程碑后，集中更新 memory-bank/progress.md
- 仅当重要文件或职责映射发生变化时，更新 memory-bank/architecture.md
