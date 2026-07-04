import { defineConfig, UserConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";
import { VitePressSidebarOptions } from "vitepress-sidebar/types";

const vitePressOptions: UserConfig = {
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

  ignoreDeadLinks: "localhostLinks",
};

const vitePressSidebarOptions: VitePressSidebarOptions = {
  documentRootPath: "docs",
  collapsed: true,
  useTitleFromFileHeading: true,
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions),
);
