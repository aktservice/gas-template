# GAS テンプレートプロジェクト

## 概要

このリポジトリは、Google Apps Script (GAS) 向けの**単一プロジェクト特化型テンプレート**を提供します。Vite、esbuild、TypeScript、そしてテスト・ビルドに必要なツールがあらかじめルートレベルで設定されており、設定に時間を取られずにスムーズにアプリケーション開発に集中できます。

マルチプロジェクト構成から単一アプリケーション開発へと最適化され、バックエンド（GAS）とフロントエンド（Viteによる単一HTML化）をシームレスにビルドできます。

## 特長

- **単一プロジェクト特化**: 複雑なプロジェクト切り替えや環境変数の指定が不要なシンプル設計
- **Vite** による高速なフロントエンド開発サーバーと、GAS用に最適化された単一HTMLビルド
- **esbuild & esbuild-gas-plugin** による、GAS（ES2019 / V8エンジン）互換の高速バックエンドビルド
- **TypeScript** によるバックエンド・フロントエンド両方の厳格な型チェック
- **Jest** を用いた、DI（依存性の注入）ベースのテストフレームワーク
- **Docker** を利用したコンテナ開発・本番ビルド環境の提供
- **Prettier** による統一されたコードスタイル

## はじめに

### 前提条件

- **Node.js** (>= 18)
- **npm** (Node.js に同梱)
- **Docker**（オプション、コンテナ利用時）
- **WSL2**（Windows 推奨）

### 1. インストール手順

```bash
# リポジトリのディレクトリへ移動
cd gas-template

# 依存パッケージをインストール
npm ci   # package-lock.json を利用した再現性のあるインストール

# boilerplate から src ディレクトリへ必要なコードを配置
# (※すでに src/ が存在し、上書きしたくない場合はご注意ください)
cp -r boilerplate/sample-vanilla/src/* ./src/
cp boilerplate/sample-vanilla/appsscript.json ./

# 開発コマンド一覧
npm run dev
# 本番ビルドコマンド
npm run build
# テストコマンド
npm test
```

## スクリプト一覧
| スクリプト | コマンド | 説明 |
| :--- | :--- | :--- |
| `dev` | `vite` | フロントエンドの Vite 開発サーバーを起動（HMR有効） |
| `build` | `node scripts/build.js` | フロントエンドとGASバックエンドを `dist/` へ一括本番ビルド |
| `test` | `jest` | `test/` ディレクトリ配下の Jest 単体テストを実行 |
| `typecheck` | `tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.frontend.json` | バックエンド（ES2019・DOMなし）とフロントエンド（DOMあり）の型チェックを実行 |
| `format` | `prettier --write ...` | Prettier で `src/`・`boilerplate/`・`test/`・`scripts/` を整形 |


## 補足

- `boilerplate/*/dist/` はビルド成果物のため Git 管理外です。clone 直後は存在しません。
- `esbuild-gas-plugin@0.9.0` は内部に `esbuild@0.18.20` を持ち、ルートの `esbuild`（0.25系）とバージョンが異なります。`esbuild.js` は JavaScript のため現状は型エラーになりません。
- ルールファイルは `AGENTS.md` に集約しています（`CLAUDE.md` は `@AGENTS.md` を読み込むだけです）。
- Docker 関連は `Dockerfile` / `docker-compose.yml` を参照してください。
