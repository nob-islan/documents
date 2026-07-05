import DefaultTheme from "vitepress/theme";
import DocCard from "./components/DocCard.vue";
import "./index.css";
import "./sidebar.css";
import "./toc.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DocCard", DocCard);
  },
};
