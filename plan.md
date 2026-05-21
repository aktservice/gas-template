# Project/Feature Name: [例: projects/project-name の新規作成 or 機能追加]

## 1. Goal (ゴール)
- 期待する動作: 
  - [例: Googleフォームの回答をトリガーに、特定シートへ書き込み、GmailとGChatへ通知する]
- 成功基準 (Definition of Done):
  - [ ] 対象プロジェクトの `src/backend/index.ts` にエントリポイントが実装されていること
  - [ ] `npm run build`（または対象のビルドコマンド）がエラーなしで通ること
  - [ ] `dist/backend.js` および `appsscript.json` が正しく生成されていること
  - [ ] 関連する単体テスト（Jest）がすべてパスすること

## 2. Context & Background (背景・コンテキスト)
- 対象プロジェクトのパス: `projects/[プロジェクト名]/`
- プロジェクトタイプ: [sample-be-only / sample-vanilla / sample-vue / 新規テンプレート]
- 依存関係・共有コード: `src/shared/backend/` の共通サービス（Logger, Mail等）を利用するかどうか

## 3. Tech Stack & Constraints (GAS特有の制約事項)
- ツール/言語: TypeScript, esbuild / vite, Jest, clasp
- GAS制約事項:
  - **グローバル関数の露出:** `index.ts` でGASのトリガーや実行用に関数を `global` にアタッチすること。
  - **ライブラリ制限:** Node.js固有のモジュール（`fs`, `path`等）や、GAS環境で動かない外部ライブラリをバンドルに含めないこと。
  - **同期処理:** GASは非同期（`async/await`）が動くが、トリガー実行のトップレベルは同期的に処理される必要がある。
- 禁止事項: `projects/[プロジェクト名]/dist/` 内のファイルを直接手修正しないこと（必ず `src/` を修正する）。

---

## 4. Implementation Steps (実装ステップ)

### Phase 1: 開発環境の準備 (Setup & Scaffolding)
- [ ] `projects/[プロジェクト名]/` のディレクトリ構造を作成（既存のsampleを参考にする）
- [ ] `appsscript.json` の配置とスコープ設定（OAuthScopesの確認）
- [ ] `tsconfig.json` や全体のビルド設定（`esbuild.js`など）に対象プロジェクトが追加されているか確認

### Phase 2: データ構造・インターフェース定義 (Types & Core)
- [ ] 必要な型定義の作成（`@types/` またはプロジェクト内の `types/`）
- [ ] Repository / Service インターフェースの定義（DIコンテナ `container.ts` への登録計画）

### Phase 3: ロジック・コンポーネント実装 (Logic & Frontend)
- [ ] `src/backend/repositories/` の実装（スプレッドシート操作等）
- [ ] `src/backend/services/` のビジネスロジック実装
- [ ] （フロントがある場合）`src/frontend/` の実装とVite設定の確認
- [ ] `src/backend/index.ts` へのルーティング/エントリポイントの実装とグローバル露出

### Phase 4: ローカル検証・テスト (Build & Test)
- [ ] ビルドコマンドの実行（例: `node esbuild.js` などのプロジェクト固有コマンド）
- [ ] ローカルテストの実行 (`npm run test` または `npx jest`)
- [ ] Linter / Type Check の実行

### Phase 5: デプロイ準備・クリーンアップ (Cleanup)
- [ ] 不要なログ（`console.log`）の削除（GASでは `Logger.log` や `LoggerService` を徹底）
- [ ] `clasp push` による検証環境へのアップロード準備

---

## 5. Agent Instructions (エージェント別実行指示)

### 🤖 For Antigravity (Agent Mode)
> あなたは自律型エージェントです。上の「4. Implementation Steps」を1ステップずつ実行してください。
> 各フェーズのコード作成後は、必ずローカルビルドコマンドを実行して構文エラーや型エラーがないか検証し、エラーがあれば自律的にデバッグ・修正を行ってください。

### 💻 For Cursor (Composer / Rules)
> ルールに従い、`projects/[プロジェクト名]/src/` 内の複数ファイルを跨いだリファクタリングと実装を行ってください。
> 修正時は、常に `@projects/[プロジェクト名]/appsscript.json` などのコンテキストを参照し、GAS固有のグローバル変数や型定義（`@types`）との整合性を保ってください。

### 📝 For Claude (CLI / Chat)
> `CLAUDE.md` の開発ガイドラインに従ってください。
> 実装コードを提案する際は、どのファイルに対する修正かを明記し、ビルド（`npm run build` 等）が通る状態を維持してください。

---

## 6. Notes & Logs (メモ・実行ログ)
- [YYYY-MM-DD]: