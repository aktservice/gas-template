import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const project = process.env.PROJECT;
const frontend = process.env.FRONTEND; // 'vue', 'vanilla', or omitted/none

if (!project) {
  console.error("❌ エラー: PROJECT環境変数が指定されていません。");
  console.error("使用例: PROJECT=sample-vue FRONTEND=vue node scripts/build.js");
  process.exit(1);
}

const projectPath = path.resolve("projects", project);
const distPath = path.join(projectPath, "dist");

if (!fs.existsSync(projectPath)) {
  console.error(`❌ エラー: 指定されたプロジェクトフォルダ '${project}' が存在しません。`);
  process.exit(1);
}

console.log(`\n🚀 [Monorepo Builder] プロジェクト '${project}' のビルドを開始します...\n`);

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

// 2. フロントエンドのビルド (指定がある場合のみ)
if (frontend && (frontend === "vue" || frontend === "vanilla")) {
  console.log(`📦 フロントエンドのビルドを実行中 (${frontend})...`);
  try {
    execSync(`npx vite build`, {
      stdio: "inherit",
      env: {
        ...process.env,
        PROJECT: project,
        FRONTEND: frontend
      }
    });
    console.log(`✅ フロントエンドのビルドに成功しました。`);
  } catch (err) {
    console.error(`❌ フロントエンドのビルドに失敗しました。`);
    process.exit(1);
  }
} else {
  console.log(`⏭️ フロントエンド指定がないため、フロントエンドのビルドをスキップします。`);
}

// 3. バックエンドのビルド (esbuild)
console.log(`⚙️ バックエンドのビルドを実行中...`);
try {
  execSync(`node esbuild.js`, {
    stdio: "inherit",
    env: {
      ...process.env,
      PROJECT: project
    }
  });
  console.log(`✅ バックエンドのビルドに成功しました。`);
} catch (err) {
  console.error(`❌ バックエンドのビルドに失敗しました。`);
  process.exit(1);
}

// 4. appsscript.json のコピー
const appsscriptJsonPath = path.join(projectPath, "appsscript.json");
const appsscriptJsonDest = path.join(distPath, "appsscript.json");

if (fs.existsSync(appsscriptJsonPath)) {
  fs.copyFileSync(appsscriptJsonPath, appsscriptJsonDest);
  console.log(`📄 appsscript.json をコピーしました。`);
} else {
  console.warn(`⚠️ 警告: appsscript.json がプロジェクト配下に見つかりません。`);
}

// 5. 静的アセット (static) のコピー (存在する場合のみ)
const staticPath = path.join(projectPath, "src/backend/static");
if (fs.existsSync(staticPath)) {
  try {
    fs.cpSync(staticPath, distPath, { recursive: true });
    console.log(`📂 静的ファイルをコピーしました: ${staticPath}`);
  } catch (err) {
    console.error(`❌ 静的ファイルのコピーに失敗しました:`, err);
    process.exit(1);
  }
}

console.log(`\n🎉 [Monorepo Builder] プロジェクト '${project}' のビルドが正常に完了しました！`);
console.log(`成果物出力先: ${distPath}\n`);
