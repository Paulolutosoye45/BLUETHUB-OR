import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()] as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@bluethub/ui-kit": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  optimizeDeps: {
  exclude: ["@bluethub/ui-kit"],
  include: ["chrono-node"], // keep real node_modules deps here, just not ui-kit
},
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:5196",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
