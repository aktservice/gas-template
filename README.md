# GAS Unified Template

統合された Google Apps Script (GAS) 開発用テンプレートです。Vue 3、Vanilla JS、バックエンドのみ、使い捨てスクリプトの4つの開発モードをサポートしています。

## 📂 ディレクトリ構成

```text
.
├── src/
│   ├── backend/        # 共通のバックエンドロジック (TypeScript)
│   └── frontend/
│       ├── vue/        # Vue 3 フロントエンド
│       └── vanilla/    # Vanilla JS フロントエンド (Handlebars対応)
├── one-time-src/       # 使い捨て・メンテナンス用スクリプト
├── test/               # Jestによるテストコード
├── dist/               # ビルド成果物 (clasp push対象)
├── package.json        # 統合プロジェクト設定
├── vite.config.ts      # フロントエンドビルド設定 (Vite)
├── esbuild.js          # バックエンドビルド設定 (esbuild)
├── appsscript.json     # GASプロジェクト設定
└── .editorconfig       # エディタのコード規約設定
```

## 🚀 開発の始め方

### 1. 環境構築
- **コンテナを利用する場合**: VS Code の `Dev Containers: Reopen in Container` を実行してください。
- **ローカルを利用する場合**: `npm install` を実行してください。

### 2. GASとの連携
1. `clasp login` でログイン。
2. `.clasp.json` を作成または既存のスクリプトIDを設定。

### 3. ビルドとデプロイ
開発の目的に応じてスクリプトを使い分けます。

| モード | ビルドコマンド | デプロイコマンド | 概要 |
| :--- | :--- | :--- | :--- |
| **Vue 3** | `npm run build:vue` | `npm run deploy:vue` | Vue 3 + Backend |
| **Vanilla** | `npm run build:vanilla` | `npm run deploy:vanilla` | Vanilla JS + Backend |
| **Backend Only** | `npm run build:be-only` | `npm run deploy:be-only` | Backendのみ (Managed) |
| **One-time** | `npm run build:one-time` | `npm run deploy:one-time` | 使い捨て/メンテ用スクリプト |

## 🛠️ 主な機能

- **Vite & esbuild**: 高速なビルドと TypeScript サポート。
- **DI サポート**: `src/backend/core/container.ts` による簡易的な依存性注入。
- **Jest**: `npm run test` でユニットテストを実行。
- **EditorConfig**: ダブルコーテーション、インデントサイズ2を標準化。

## 📜 コマンド一覧

- `npm run dev:vue`: Vueフロントエンドの開発サーバー起動
- `npm run dev:vanilla`: Vanillaフロントエンドの開発サーバー起動
- `npm run test`: Jestによるテスト実行
- `npm run typecheck`: TypeScriptの型チェック
- `npm run clean`: `dist` ディレクトリの初期化
