import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://lizengsheng.github.io",
    title: "Li Zengsheng's Blog",
    description:
      "关注大模型后训练、Agent 与 Agentic RL 算法原理与工程实践。",
    author: "Li Zengsheng",
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
      linkTitle: "访问 Li Zengsheng 的 GitHub",
    },
    {
      name: "mail",
      url: "mailto:1910853272@qq.com",
      linkTitle: "发送邮件给 Li Zengsheng",
    },
  ],
  shareLinks: [
    {
      name: "mail",
      url: "mailto:?subject=%E5%88%86%E4%BA%AB%E4%B8%80%E7%AF%87%E6%8A%80%E6%9C%AF%E6%96%87%E7%AB%A0&body=",
    },
  ],
});
