# 架构索引

- `astro-paper.config.ts`：站点身份、文章分页、功能开关、社交与分享链接。
- `astro.config.ts`：Astro 集成、语言、基路径和 Markdown 配置。
- `src/i18n/`：类型安全的中文 UI 词条和翻译加载逻辑。
- `src/pages/`：主页、文章、标签、归档、搜索、RSS、robots 与 404 路由。
- `src/content/pages/about.md`：公开个人资料、教育背景与学习仓库。
- `src/content/posts/`：公开技术文章；下划线开头文件和目录不参与文章集合。
- `src/styles/`：主题、中文字体栈和 Markdown 正文排版。
- `public/`：favicon 与静态社交预览图。
- `scripts/copy-pagefind.mjs`：生产构建后将 Pagefind 资源复制到 `public/pagefind`，兼容 Windows 和 CI。
- `scripts/check-live-links.mjs`：从线上首页抓取并检查站内页面、资源、锚点与外部 HTTP(S) 链接。
- `docs/UPDATE-GUIDE.md`：文章、页面和链接的本地更新、验证、推送与 Pages 发布流程。
- `.github/workflows/`：PR 质量检查和 GitHub Pages 部署。
- `memory-bank/`：设计、技术栈、计划、架构索引与进度记录。
