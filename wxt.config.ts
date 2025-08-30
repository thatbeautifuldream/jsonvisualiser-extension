import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: {
		name: "Sidepanel Extension Template",
		description: "A template for creating Chrome sidepanel extensions",
		version: "1.0.0",
		action: {
			default_title: "Open Sidepanel",
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
