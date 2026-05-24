# CLAUDE.md - AI Agent Guidelines

このファイルは、AIエージェント（Claude Code 等）に対して、このGASプロジェクトのビルドコマンド、ディレクトリ構造、およびアーキテクチャパターンを指示するものです。

## 🚀 ビルドおよび開発コマンド

すべての開発コマンドは環境変数に依存せず、単一のプロジェクトとして実行されます。

### 1. ビルドコマンド
- **プロジェクトのビルド**: `npm run build` (内部で `node scripts/build.js` を実行)
- **出力先のクリーンアップ**: ビルドスクリプト内で自動実行されますが、手動で行う場合は以下を実行:
  `node -e "const fs=require('fs'); fs.rmSync('./dist', {recursive:true, force:true})"`

### 2. ローカル開発サーバー (フロントエンドがある場合)
- **フロントエンドの起動 (Vite)**: `npx vite` または `npm run dev` (設定されている場合)

### 3. テストおよびコード品質
- **すべての単体テストを実行**: `npm run test`
- **型チェックの実行**: `npm run typecheck` (ES2019設定でプロジェクト全体の型を確認)
- **コードのフォーマット**: `npm run format` (Prettier)

---

## 📂 リポジトリ構造 (Repository Structure)

```text
.
├── src/
│   ├── backend/                 # GAS バックエンドのソースコード
│   │   ├── core/                # DIコンテナ、共通設定
│   │   ├── api/                 # Web Appのエンドポイント（doGet/doPostなど）
│   │   ├── services/            # ビジネスロジック（MailServiceなど）
│   │   ├── repositories/        # データアクセス（SheetRepositoryなど）
│   │   └── index.ts             # バックエンドのエントリーポイント
│   └── frontend/                # フロントエンドのソースコード (Vue / Vanillaなど)
├── dist/                        # esbuild & Vite の出力先 (clasp push の対象)
│   ├── appsscript.json          # GAS プロジェクトの定義ファイル
│   ├── backend.js               # バンドルされたバックエンドコード
│   └── index.html               # フロントエンドがある場合の単一HTML
├── appsscript.json              # ルート管理の GAS マニフェスト
├── .clasp.json                  # clasp のデプロイ連携設定
├── package.json                 # 依存関係の一元管理
├── tsconfig.json                # TSコンパイラ設定 (ターゲット: ES2019)
├── esbuild.js                   # バックエンド用 esbuild 設定ファイル
└── vite.config.ts               # フロントエンド用 Vite 設定ファイル
