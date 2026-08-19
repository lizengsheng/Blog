# 进度记录

## 2026-08-19：项目基线

- 从 AstroPaper `main` 分支初始化项目，保留 `upstream` 远程用于后续参考。
- 建立项目级 `AGENTS.md` 和完整 memory-bank。

## 2026-08-19：中文化与个人品牌

- 配置 `zh-CN`、`Asia/Shanghai`、`/Blog` 基路径和 GitHub Pages 站点地址。
- 完成导航、搜索、分页、文章元信息、标签、归档、404、分享与无障碍文本的中文化。
- 重写首页与 About，只保留已确认的教育、方向、邮箱、GitHub 和公开学习仓库信息。
- 新增 LZS SVG favicon 与静态 PNG 社交预览图，关闭动态中文 OG 图生成。
- 修正 RSS、robots、canonical、站点地图、搜索资源和搜索结果 URL 的子路径处理。

## 2026-08-19：首发内容与写作流程

- 删除 AstroPaper 演示文章和模板个人信息。
- 发布后训练、Agent 工程、Agentic RL 三篇公开的“持续更新”技术提纲。
- 新增不参与构建的 `_template.md` 和中文 README；引用仅使用论文或官方文档。

## 2026-08-19：部署与验证

- 新增 GitHub Pages 部署工作流；PR CI 使用 Node 24 和 pnpm 11.19.0。
- 将 Unix 专用的 Pagefind 复制命令替换为跨平台 Node 脚本。
- `pnpm install --frozen-lockfile`、格式检查、lint 和完整构建通过；Astro 检查为 0 错误、0 警告、0 提示。
- 生产构建生成 20 个页面；Pagefind 识别 `zh-cn`，索引 3 篇文章和 747 个词。
- 本地预览验证主页、文章、标签、归档、搜索、About、RSS、站点地图和静态资源均返回 200。
- 生成产物检查确认 URL 均位于 `/Blog/`，中文 Pagefind 查询可返回正确文章。
- 完成桌面浅色、桌面深色和 390px 移动端视觉检查；移动端无文档级横向溢出。

## 2026-08-19：在线简历入口

- 在全站顶部导航加入“简历”入口，使用新窗口打开在线简历。
- 在首页首屏加入高可见度的“查看在线简历”按钮，并在 About 联系方式中同步展示。

## 2026-08-19：远程仓库与正式部署

- 创建公开仓库 `https://github.com/lizengsheng/Blog`，将当前博客快照作为独立项目的根提交推送到 `main`。
- 保留 AstroPaper MIT 许可证和 `upstream` 远程，不携带模板仓库的工作流历史。
- 通过仓库网页添加 Pages 部署与 PR CI 工作流，并同步回本地 `main`。
- 将 GitHub Pages Source 设置为 GitHub Actions，正式地址为 `https://lizengsheng.github.io/Blog/`。
- Pages 生产构建与部署成功；线上主页、文章、About、搜索、RSS、站点地图、favicon 和 Pagefind 资源均返回 200。
- 在线 Pagefind 使用 `Agentic RL` 查询可返回正确文章，首页 canonical、中文标题和在线简历链接均正确。
