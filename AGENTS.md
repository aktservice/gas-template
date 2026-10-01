# AGENTS.md - AI Agent Guidelines

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
- **型チェックの実行**: `npm run typecheck` (バックエンド用 `tsconfig.json` と フロントエンド用 `tsconfig.frontend.json` の両方を確認)
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
├── tsconfig.json                # バックエンド用TS設定 (ES2019 / DOMなし)
├── tsconfig.frontend.json       # フロントエンド用TS設定 (DOMあり)
├── esbuild.js                   # バックエンド用 esbuild 設定ファイル
└── vite.config.ts               # フロントエンド用 Vite 設定ファイル

---

## 📝 コーディング規約

- 言語は TypeScript。インデントはスペース2つ、セミコロン必須、文字列はダブルクォート。
- ターゲットは `ES2019`。`#private` などGAS V8で動かない構文は使わず、`private` / `protected` 修飾子を使う。
- 計画・設計メモはリポジトリにファイルとして残さず、Issue（`implementation_plan.yml` テンプレート）に書く。

## ⚡ GAS 必須ルール

- esbuild は全モジュールを単一の `backend.js` にバンドルするため、トリガー（`onOpen` / `doGet` / `doPost` など）やシートから呼ぶ関数は `global` に明示的に割り当てる（例: `(global as any).onOpen = () => {...}`）。
- HTTP 通信は `fetch()` / `axios` ではなく `UrlFetchApp.fetch()` を使う。
- スプレッドシート操作は `SheetRepository<T>` 経由で行い、`getSheetByName` を各所に直接書かない。
- サービスの登録・取得は `src/backend/core/container.ts` の `Container`（DI）を使う。
- フロントエンドは `vite-plugin-singlefile` で単一HTMLにバンドルする。
- 依存関係（`package.json`）と型定義はルート直下で一元管理し、サブディレクトリに個別設定を作らない。
