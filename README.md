# Li Zengsheng’s Blog

基于 [AstroPaper](https://github.com/satnaing/astro-paper) 构建的 Blog，聚焦大模型后训练、Agent 与 Agentic RL。

- 线上地址：<https://lizengsheng.github.io/Blog/>
- 默认语言：简体中文
- 部署方式：GitHub Pages + GitHub Actions
- 内容能力：Markdown/MDX、标签、归档、RSS、Pagefind 中文搜索

## 本地开发

需要 Node.js 22.12 或更高版本，并使用 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

常用命令：

```bash
pnpm run format:check
pnpm run lint
pnpm run build
pnpm preview
```

由于站点配置了 `/Blog` 基路径，本地预览入口通常为 `http://localhost:4321/Blog/`。

## 新增文章

1. 复制 `src/content/posts/_template.md`，并将文件名改为稳定的英文 URL slug。
2. 填写 `title`、`pubDatetime`、`tags` 和 `description`。
3. 写作期间保持 `draft: true`；准备发布时改为 `false`。
4. 对实验环境、版本、参数和结果保留可复现记录；未完成的实验必须明确标记为计划。
5. 优先引用原始论文、官方文档和项目仓库。

下划线开头的文件不会进入 Astro Content Collection，因此 `_template.md` 不会被发布。

## 部署到 GitHub Pages

1. 在 GitHub 创建公开仓库 `lizengsheng/Blog`。
2. 将本地仓库推送到该仓库的 `main` 分支。
3. 在仓库 **Settings → Pages** 中将 Source 设置为 **GitHub Actions**。
4. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建和部署。

项目站点使用 `site: https://lizengsheng.github.io` 与 `base: /Blog`。如果仓库名发生变化，需要同步修改 `astro.config.ts`、编辑文章链接以及 README 中的地址。

## 项目文档

详细的文章、页面、链接更新与 GitHub Pages 发布流程见 [内容更新与部署指南](docs/UPDATE-GUIDE.md)。设计、技术栈、实施批次与进度记录位于 `memory-bank/`。后续维护前请先阅读 `AGENTS.md`。

## 致谢与许可

本项目基于 MIT 许可的 AstroPaper 主题开发，原始版权与许可证见 [LICENSE](LICENSE)。博客正文版权归作者所有。
