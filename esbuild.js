import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";
import { resolve } from "path";

const project = process.env.PROJECT;
if (!project) {
  console.error("エラー: PROJECT環境変数を指定してください。 (例: PROJECT=sample-vue)");
  process.exit(1);
}

const entryPoint = `./projects/${project}/src/backend/index.ts`;
const outfile = `./projects/${project}/dist/backend.js`;

esbuild
  .build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: false,
    outfile: outfile,
    target: "ES2019", // GAS V8環境のクラス互換性を保つためにES2019を指定
    plugins: [GasPlugin],
    legalComments: "inline",
    charset: "utf8",
  })
  .catch((e) => {
    console.error(`Esbuild ビルドエラー (${project}):`, e);
    process.exit(1);
  });
