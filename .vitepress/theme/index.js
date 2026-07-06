import DefaultTheme from "vitepress/theme";
import DocCard from "./components/DocCard.vue";
import "./static/index.css";
import "./static/sidebar.css";
import "./static/toc.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DocCard", DocCard);
  },
};
