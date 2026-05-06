import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

const frontendType = process.env.FRONTEND || "vue";
const root = resolve(__dirname, `src/frontend/${frontendType}`);

export default defineConfig({
  root,
  plugins: [
    frontendType === "vue"
      ? vue()
      : (handlebars({
          partialDirectory: resolve(root, "partials"),
        }) as any),
    tailwindcss(),
    viteSingleFile(),
  ],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
  },
});
