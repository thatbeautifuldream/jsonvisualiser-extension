import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "JSON Visualiser",
    description: "Chrome sidepanel extension for JSON visualization",
    version: "1.0.0",
    action: {
      default_title: "Open JSON Visualiser",
    },
    side_panel: {
      default_path: "sidepanel.html",
    },
    permissions: ["sidePanel"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
