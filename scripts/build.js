import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// 単独プロジェクト用にルートのパスを定義
const distPath = path.resolve("dist");
const srcPath = path.resolve("src");

console.log(`\n🚀 [Project Builder] ビルドを開始します...\n`);

// 1. distフォルダの初期化 (クリーンアップ)
try {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  fs.mkdirSync(distPath, { recursive: true });
  console.log(`🧹 Output directory cleaned: ${distPath}`);
} catch (err) {
  console.error(`❌ distフォルダの初期化に失敗しました:`, err);
  process.exit(1);
}

// 2. フロントエンドのビルド (vite.config.ts やフロントエンドコードが存在する場合のみ実行)
// ※もしフロントエンドが完全に不要（BEのみ）なら、このif文ブロックごと削除しても大丈夫です。
const hasFrontend =
  fs.existsSync(path.join(srcPath, "frontend")) || fs.existsSync(path.resolve("vite.config.ts"));

if (hasFrontend) {
  console.log(`📦 フロントエンドのビルドを実行中 (Vite)...`);
  try {
    execSync(`npx vite build`, { stdio: "inherit" });
    console.log(`✅ フロントエンドのビルドに成功しました。`);
  } catch (err) {
    console.error(`❌ フロントエンドのビルドに失敗しました。`);
    process.exit(1);
  }
} else {
  console.log(`⏭️ フロントエンド構成が見つからないため、ビルドをスキップします。`);
}

// 3. バックエンドのビルド (esbuild)
console.log(`⚙️ バックエンドのビルドを実行中...`);
try {
  execSync(`node esbuild.js`, { stdio: "inherit" });
  console.log(`✅ バックエンドのビルドに成功しました。`);
} catch (err) {
  console.error(`❌ バックエンドのビルドに失敗しました。`);
  process.exit(1);
}

// 4. appsscript.json のコピー (ルート直下、またはsrc/backend直下から探す)
let appsscriptJsonPath = path.resolve("appsscript.json");
if (!fs.existsSync(appsscriptJsonPath)) {
  appsscriptJsonPath = path.join(srcPath, "backend", "appsscript.json");
}
const appsscriptJsonDest = path.join(distPath, "appsscript.json");

if (fs.existsSync(appsscriptJsonPath)) {
  fs.copyFileSync(appsscriptJsonPath, appsscriptJsonDest);
  console.log(`📄 appsscript.json をコピーしました。`);
} else {
  console.warn(`⚠️ 警告: appsscript.json が見つかりません。`);
}

// 5. 静的アセット (static) のコピー (src/backend/static が存在する場合のみ)
const staticPath = path.join(srcPath, "backend/static");
if (fs.existsSync(staticPath)) {
  try {
    fs.cpSync(staticPath, distPath, { recursive: true });
    console.log(`📂 静的ファイルをコピーしました: ${staticPath}`);
  } catch (err) {
    console.error(`❌ 静的ファイルのコピーに失敗しました:`, err);
    process.exit(1);
  }
}

console.log(`\n🎉 [Project Builder] ビルドが正常に完了しました！`);
console.log(`成果物出力先: ${distPath}\n`);
