import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";
import fs from "fs";

const entryPoint = "./src/backend/index.ts";
const outfile = "./dist/backend.js";

if (!fs.existsSync(entryPoint)) {
  console.error(`❌ エントリポイントが見つかりません: ${entryPoint}`);
  console.error(`   boilerplate/ からひな型をコピーして src/backend/index.ts を用意してください。`);
  process.exit(1);
}

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
    console.error(`Esbuild ビルドエラー:`, e);
    process.exit(1);
  });
