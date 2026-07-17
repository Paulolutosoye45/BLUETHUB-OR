import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@bluethub/ui-kit": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});


// opencode -s ses_09f59afbeffenihCokfcLf3U2T
