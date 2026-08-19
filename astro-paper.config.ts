import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://lizengsheng.github.io",
    title: "李增圣的技术博客",
    description:
      "聚焦大模型后训练、Agent 与 Agentic RL，记录原理、工程实践与持续学习。",
    author: "李增圣",
    profile: "https://github.com/lizengsheng",
    ogImage: "default-og.png",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/lizengsheng/Blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/lizengsheng",
      linkTitle: "访问李增圣的 GitHub",
    },
    {
      name: "mail",
      url: "mailto:1910853272@qq.com",
      linkTitle: "发送邮件给李增圣",
    },
  ],
  shareLinks: [
    {
      name: "mail",
      url: "mailto:?subject=%E5%88%86%E4%BA%AB%E4%B8%80%E7%AF%87%E6%8A%80%E6%9C%AF%E6%96%87%E7%AB%A0&body=",
    },
  ],
});
