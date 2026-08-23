import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";
import { existsSync } from "fs";

const root = resolve(__dirname, "src/frontend");
const outDir = resolve(__dirname, "dist");

if (!existsSync(root)) {
  throw new Error(
    "src/frontend が存在しません。フロントエンドを使う場合は boilerplate/ からひな型をコピーしてください。",
  );
}

// FRONTEND 未指定時は src/frontend/src/App.vue の有無で Vue / Vanilla を自動判定する
const frontendType =
  process.env.FRONTEND ?? (existsSync(resolve(root, "src/App.vue")) ? "vue" : "vanilla");

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
    target: "es2019", // クライアント側JSの互換性を考慮してES2019に引き下げ
  },
});
