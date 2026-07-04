import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

const vitePressOptions = {
  srcDir: "docs",

  title: "Nob docs",
  description: "Nob tech document",
  themeConfig: {
    head: [["link", { rel: "icon", href: "/favicon.ico" }]],
    logo: "icon.png",

    docFooter: {
      prev: false,
      next: false,
    },
    outline: {
      level: [2, 4],
    },
    search: {
      provider: "local",
    },
  },

  ignoreDeadLinks: true,
};

const vitePressSidebarOptions = {
  documentRootPath: "docs",
  collapsed: true,
  useTitleFromFileHeading: true,
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions),
);
