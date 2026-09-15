# 架构索引

- `astro-paper.config.ts`：站点身份、文章分页、功能开关、社交与分享链接。
- `astro.config.ts`：Astro 集成、语言、基路径和 Markdown 配置。
- `src/i18n/`：类型安全的中文 UI 词条和翻译加载逻辑。
- `src/pages/`：主页、文章、标签、归档、搜索、RSS、robots 与 404 路由。
- `src/content/pages/about.md`：公开个人资料、教育背景、关注方向与联系方式。
- `src/content/posts/`：公开技术文章；下划线开头文件和目录不参与文章集合。
- `src/styles/`：主题、中文字体栈和 Markdown 正文排版。
- `src/utils/remark-mermaid.ts`：保留 Mermaid 源码的 Markdown 转换器，避免流程图被当作普通代码高亮。
- `src/scripts/diagrams.ts`：视口附近按需加载 Mermaid，处理页面切换、主题变化及渲染失败回退；公式由 KaTeX 构建时渲染。
- `src/components/PostToc.astro`、`src/scripts/post-toc.ts`、`src/styles/post-reading.css`：构建时目录、宽屏侧栏、移动抽屉与阅读样式。
- `src/scripts/post-interactions.js`：文章生命周期、阅读进度、代码复制和图片预览。
- `src/utils/rehype-reading.ts`：构建时为正文图片加入延迟加载与异步解码。
- `public/`：favicon 与静态社交预览图。
- `scripts/copy-pagefind.mjs`：生产构建后将 Pagefind 资源复制到 `public/pagefind`，兼容 Windows 和 CI。
- `scripts/check-live-links.mjs`：从线上首页抓取并检查站内页面、资源、锚点与外部 HTTP(S) 链接。
- `docs/UPDATE-GUIDE.md`：文章、页面和链接的本地更新、验证、推送与 Pages 发布流程。
- `.github/workflows/`：PR 质量检查和 GitHub Pages 部署。
- `memory-bank/`：设计、技术栈、计划、架构索引与进度记录。
