# 内容更新与 GitHub Pages 部署指南

本文档用于维护 Li Zengsheng 的 Blog。无论是更新文章、首页文案还是链接，都应在本地验证后立即推送到远端 `main`；推送会触发 GitHub Actions，并自动更新 GitHub Pages。

## 1. 更新前同步代码

在 PowerShell 中进入项目目录：

```powershell
cd C:\Users\19108\Desktop\lizengsheng\Blog
git switch main
git pull --ff-only origin main
git status --short
pnpm install --frozen-lockfile
```

如果 `git status --short` 显示了自己尚未提交的修改，先确认这些修改是否需要保留，不要直接覆盖。

## 2. 更新或新增文章

文章位于 `src/content/posts/`。

- 更新文章：直接编辑对应的 `.md` 或 `.mdx` 文件。
- 新增文章：复制 `src/content/posts/_template.md`，使用稳定的英文文件名作为 URL slug。
- 写作中：设置 `draft: true`，文章不会出现在生产站点。
- 正式发布：设置 `draft: false`，并确认 `pubDatetime`、`title`、`description`、`tags` 等信息正确。
- 图片：放在 `public/assets/` 的合适子目录中，引用路径需要包含站点基路径，例如 `/Blog/assets/posts/example.png`。

不要编辑 `dist/` 或 `public/pagefind/`。它们是构建产物，会由构建流程重新生成。

## 3. 更新前端文案或链接

常用文件如下：

| 内容                         | 文件                          |
| ---------------------------- | ----------------------------- |
| 站点标题、作者、GitHub、邮箱 | `astro-paper.config.ts`       |
| 首页介绍、简历按钮           | `src/pages/index.astro`       |
| 顶部导航                     | `src/components/Header.astro` |
| About 内容与项目链接         | `src/content/pages/about.md`  |
| 中文 UI 词条                 | `src/i18n/lang/zh-CN.ts`      |
| favicon 与社交预览图         | `public/`                     |

站内地址必须兼容 `/Blog/` 子路径。Astro 组件中优先使用现有的 `getRelativeLocaleUrl` 或 `import.meta.env.BASE_URL`；Markdown 中的站内静态资源使用 `/Blog/...`。外部链接使用完整的 `https://...` 地址。

## 4. 本地预览与验证

先启动开发服务器并手动查看改动：

```powershell
pnpm dev
```

浏览器打开 `http://localhost:4321/Blog/`。重点检查桌面端、移动端、深浅主题，以及新增或修改的链接。

提交前运行：

```powershell
pnpm run format:check
pnpm run lint
pnpm run build
git diff --check
```

如果格式检查失败，可运行 `pnpm run format`，然后重新检查改动，避免格式化到不相关文件。

## 5. 提交并立即推送

确认修改后，在同一维护批次内提交并推送：

```powershell
git status --short
git diff
git add -A
git commit -m "docs: update blog content"
git push origin main
```

请按实际内容修改提交信息，例如：

- 新文章：`content: publish agent evaluation notes`
- 页面文案：`feat: refresh homepage introduction`
- 修复链接：`fix: update paper reference links`

不要只在本地长期保留已经完成的内容更新。`main` 是 GitHub Pages 的发布分支，每次完成且验证通过的本地更新都应及时推送。

## 6. 确认 GitHub Pages 更新成功

推送后查看最新部署：

```powershell
gh run list --repo lizengsheng/Blog --workflow deploy.yml --limit 3
gh run watch <运行编号> --repo lizengsheng/Blog --exit-status
```

部署成功后打开：

- Blog：<https://lizengsheng.github.io/Blog/>
- Actions：<https://github.com/lizengsheng/Blog/actions/workflows/deploy.yml>

最后巡检线上链接：

```powershell
pnpm run check:links
```

巡检结果分为三类：

- `BROKEN INTERNAL`：站内页面、资源或锚点失效，发布前应修复。
- `BROKEN EXTERNAL`：外部地址明确返回失效状态，需要人工确认后更新或删除。
- `UNVERIFIABLE`：目标网站返回 403、429、服务端错误或超时，通常是反爬限制；请用浏览器人工打开确认，不要直接当作失效链接删除。

## 7. 部署失败时排查

查看失败步骤和日志：

```powershell
gh run list --repo lizengsheng/Blog --workflow deploy.yml --limit 5
gh run view <运行编号> --repo lizengsheng/Blog --log-failed
```

修复后重新运行本地格式、lint 和构建检查，再提交并推送。不要手工修改线上 `gh-pages` 产物；GitHub Pages 应始终由 `.github/workflows/deploy.yml` 构建和发布。
