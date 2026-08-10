import { defineConfig, UserConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";
import { VitePressSidebarOptions } from "vitepress-sidebar/types";
import { withMermaid } from "vitepress-mermaid-plugin";

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

export default withMermaid(
  withSidebar(vitePressOptions, vitePressSidebarOptions),
);
