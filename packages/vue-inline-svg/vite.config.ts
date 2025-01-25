import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: resolve(import.meta.dirname, "lib/vue-inline-svg.vue"),
			fileName: "vue-inline-svg",
			formats: ["es"],
		},
		rollupOptions: {
			external: ["vue", "html-parse-stringify"],
		},
	},
});
