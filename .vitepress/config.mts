import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

const vitePressOptions = {
  srcDir: "docs",

  title: "Nob docs",
  description: "Nob tech document",
  themeConfig: {
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
};

const vitePressSidebarOptions = {
  documentRootPath: "docs",
  collapsed: true,
  useTitleFromFileHeading: true,
  sortMenusByName: false,
  manualSortFileNameByPriority: [
    "top.md", // ←これを最上位に固定
  ],
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions),
);
