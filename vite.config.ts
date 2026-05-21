import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

const project = process.env.PROJECT;
const frontendType = process.env.FRONTEND || "vue";

if (!project) {
  throw new Error("Vite エラー: PROJECT環境変数を指定してください。");
}

const root = resolve(__dirname, `projects/${project}/src/frontend`);
const outDir = resolve(__dirname, `projects/${project}/dist`);

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
    outDir,
    emptyOutDir: false, // バックエンドのビルド成果物(backend.js)を消去しないようにする
    target: "es2019",   // クライアント側JSの互換性を考慮してES2019に引き下げ
  },
});
