import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

const isOneTime = process.env.ENTRY_TYPE === "one-time";
const entryPoint = isOneTime
  ? "./one-time-src/index.ts"
  : "./src/backend/index.ts";

esbuild
  .build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: false,
    outfile: "./dist/backend.js",
    target: "ES2021",
    plugins: [GasPlugin],
    legalComments: "inline",
    charset: "utf8",
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
