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
- **WSL2**（Windows 推奨） – 本リポジトリは `\\wsl.localhost\Ubuntu26\home\aktdev\agent\gas-template` をベースに設計されています。

### 1. インストール手順

```bash
# リポジトリのディレクトリへ移動
cd gas-template

# 依存パッケージをインストール
npm ci   # package-lock.json を利用した再現性のあるインストール

# templates から src ディレクトリへ必要なコードを配置
# (※すでに src/ が存在し、上書きしたくない場合はご注意ください)
cp -r templates/sample-vanilla/src/* ./src/
cp templates/sample-vanilla/appsscript.json ./

# 開発コマンド一覧
npm run dev
# 本番ビルドコマンド
npm run build
# テストコマンド
npm test
```

#テストコマンド一覧
| スクリプト | コマンド | 説明 |
| :--- | :--- | :--- |
| `dev` | `vite` | フロントエンドの Vite 開発サーバーを起動（HMR有効） |
| `build` | `node scripts/build.js` | フロントエンドとGASバックエンドを `dist/` へ一括本番ビルド |
| `test` | `jest` | `test/` ディレクトリ配下の Jest 単体テストを実行 |
| `typecheck` | `tsc --noEmit` | `tsconfig.json`（ES2019）に基づく全体の型チェックを実行 |
| `lint` | `eslint . && prettier --check .` | コードスタイルと構文のエラーチェックを実行 |
| `format` | `prettier --write .` | Prettier を使用して全体のコードフォーマットを自動修正 |
| `docker:build` | `docker build -t gas-template .` | 開発・ビルド用の Docker イメージを生成 |
| `docker:run` | `docker run --rm -v $(pwd):/app gas-template` | Docker コンテナを起動してクリーンビルドなどを実行 |

