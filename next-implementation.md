# next-implementation.md — GAS テンプレート 現状把握と次期実装提案

- 対象リポジトリ: `aktservice/gas-template`
- 調査基準コミット: `990dff0` (`refactor:template to boilerplate,add infrastructure`)
- 調査日: 2026-08-23
- 調査方法: 全ファイル読解 + `npm ci` 後に `npm run build` / `npm run typecheck` / `npm test` を実際に実行して挙動を確認

---

## 0. 結論（サマリ）

**現状、このリポジトリを clone してそのまま使い始めることはできません。** テンプレートとしての「骨格」（レイヤ分割、DI、GAS 制約のルール化、AI エージェント向けガイドライン）は良くできていますが、**ビルド系の設定が過去のマルチプロジェクト構成（`projects/${PROJECT}/`）のまま残り、現在のディレクトリ構成（ルート `src/` + `boilerplate/`）と噛み合っていない**ため、3 つの主要コマンドがすべて失敗します。

| コマンド | 結果 | 原因 |
| :--- | :--- | :--- |
| `npm run build` | ❌ 失敗 | `vite.config.ts` / `esbuild.js` が `PROJECT` 環境変数と `projects/` を要求 |
| `npm run typecheck` | ❌ 失敗（4 件） | `boilerplate/infrastructure` の相対パス誤り、テストの参照先不在 |
| `npm test` | ❌ 失敗 | `test/container.test.ts` が存在しない `src/shared/backend/core/container` を参照 |

次期実装の最優先事項は **「新機能追加ではなく、テンプレートの一貫性回復（構成・ビルド・ドキュメントの整合）」** です。P0 は 1 日程度の作業量で、これを終えれば「clone → `npm ci` → `npm run build` → `clasp push`」が成立します。

---

## 1. 現状のリポジトリ構成（実測）

```text
.
├── src/                          # ← 単一プロジェクト用の“共通コード置き場”（index.ts なし）
│   └── backend/
│       ├── api/api.ts            # GasApiClient（UrlFetchApp ラッパ）
│       ├── core/container.ts     # 簡易 DI コンテナ
│       ├── repositories/         # IRepository / SheetRepository
│       └── services/             # LoggerService / MailService
├── boilerplate/                  # ← 用途別ひな型（4 種）
│   ├── sample-be-only/           # バックエンドのみ
│   ├── sample-one-time/          # 使い捨てスクリプト
│   ├── sample-vanilla/           # Vanilla TS + Handlebars partials
│   ├── sample-vue/               # Vue 3 + Tailwind
│   └── infrastructure/           # schema / installer / validator / configRepository
├── @types/                       # gchat / global / job2 / shims-vue
├── test/container.test.ts        # 唯一のテスト
├── scripts/build.js              # 単一プロジェクト前提のビルドオーケストレータ
├── esbuild.js                    # ★ projects/${PROJECT} 前提
├── vite.config.ts                # ★ projects/${PROJECT} 前提
├── tsconfig.json / jest.config.js / .prettierrc / .editorconfig
├── Dockerfile / docker-compose.yml / .devcontainer/
├── CLAUDE.md / .cursorrules / .antigravityrules / plan.md
└── README-jp.md
```

構成の意図としては「**ルート `src/` を単一アプリの実装場所とし、`boilerplate/` から必要なひな型をコピーして開発を始める**」という設計に見えます（`README-jp.md`・`.antigravityrules` の記述と一致）。しかし後述のとおり、その導線が成立していません。

### 良い点（維持すべき資産）

- **レイヤ分割の型が明確**: `api / core / repositories / services` の 4 層 + `property-config`。`IRepository<T>` と `SheetRepository<T>` によるシート I/O の抽象化は実用的。
- **GAS 特有の制約がルール化されている**: `global` へのアタッチ必須、`#private` 禁止、`fetch` ではなく `UrlFetchApp`、`ES2019` ターゲット、`vite-plugin-singlefile` による単一 HTML 化。AI エージェント運用の観点で価値が高い。
- **AI エージェント向けガイドラインが 3 種そろっている**: `CLAUDE.md` / `.cursorrules` / `.antigravityrules` + 作業計画テンプレの `plan.md`。
- **`boilerplate/infrastructure` の着想**: `schema.ts` を単一の真実とし、`installer`（シート・トリガー・プロパティの自動生成）と `validator`（構成検証）を対にする設計は、GAS 案件の初期構築コストをかなり下げられる。**このリポジトリで最も伸びしろがある部分。**
- **ES2019 ターゲットの徹底**、Prettier / EditorConfig / Docker / devcontainer の整備。

---

## 2. 実行して確認した不具合（一次情報）

### 2-1. `npm run build` — フロントエンドビルドで停止

```
🧹 Output directory cleaned: /home/user/gas-template/dist
📦 フロントエンドのビルドを実行中 (Vite)...
failed to load config from /home/user/gas-template/vite.config.ts
error during build:
Error: Vite エラー: PROJECT環境変数を指定してください。
❌ フロントエンドのビルドに失敗しました。
```

`PROJECT=sample-vue` を与えても、`vite.config.ts` / `esbuild.js` が参照する `projects/sample-vue/` は存在しない（実体は `boilerplate/sample-vue/`）ため成功しません。**環境変数の指定方法の問題ではなく、構成そのものの不一致です。**

### 2-2. `npm run typecheck` — 4 件のエラー

```
boilerplate/infrastructure/installer/installer.ts(7,8): error TS2307: Cannot find module '../../schema/schema'
boilerplate/infrastructure/repository/configRepository.ts(1,24): error TS2307: Cannot find module './schema'
boilerplate/infrastructure/validator/validator.ts(1,60): error TS2307: Cannot find module '../../schema/schema'
test/container.test.ts(1,27): error TS2307: Cannot find module '../src/shared/backend/core/container'
```

実体は `boilerplate/infrastructure/schema/schema.ts` なので、正しい相対パスは `../schema/schema`（`installer/`・`validator/`・`repository/` のいずれからも同じ）。3 ファイルすべてが誤っており、**`infrastructure` は一度もコンパイルされたことがない状態**です。

### 2-3. `npm test` — テストスイートが起動しない

```
FAIL test/container.test.ts
  ● Test suite failed to run
    Cannot find module '../src/shared/backend/core/container' from 'test/container.test.ts'
Test Suites: 1 failed, 1 total / Tests: 0 total
```

マルチプロジェクト時代の `src/shared/backend/` を参照したまま。現在の正しい参照先は `../src/backend/core/container`。

---

## 3. 課題一覧（優先度付き）

### P0 — テンプレートとして機能しない致命的な不整合

| # | 課題 | 該当箇所 | 影響 |
| :-- | :--- | :--- | :--- |
| P0-1 | `esbuild.js` / `vite.config.ts` が `PROJECT` 環境変数と `projects/${PROJECT}/` を前提 | `esbuild.js:6-13`, `vite.config.ts:8-17` | `npm run build` が常に失敗 |
| P0-2 | `scripts/build.js` は単一プロジェクト（ルート `src`/`dist`）前提で、上記 2 ファイルと矛盾 | `scripts/build.js` | ビルド系の設計が二重化 |
| P0-3 | ルート `src/backend/index.ts`（エントリポイント）が存在しない | `src/backend/` | 仮に P0-1 を直しても esbuild の entryPoint が解決不能 |
| P0-4 | ルートに `appsscript.json` が無い（`build.js` はルート → `src/backend/` の順で探索） | リポジトリ直下 | `dist/` に manifest が出力されず `clasp push` 不可 |
| P0-5 | `boilerplate/infrastructure` の import パス誤り（3 ファイル） | 2-2 参照 | 型エラー / そのままでは利用不可 |
| P0-6 | `test/container.test.ts` の参照先が旧構成 | `test/container.test.ts:1` | `npm test` が失敗 |

### P1 — ドキュメント・スクリプトの不整合（利用者が迷う）

| # | 課題 | 詳細 |
| :-- | :--- | :--- |
| P1-1 | `CLAUDE.md` の構造図が実態と乖離 | 図には `dist/`・ルート `appsscript.json`・`.clasp.json`・`src/backend/index.ts` があるが実在しない。`boilerplate/` の記載が無い |
| P1-2 | `README-jp.md` の手順が実行不能 | `cp -r templates/sample-vanilla/src/* ./src/` → `templates/` は存在しない（`boilerplate/`）。`npm run dev` も未定義 |
| P1-3 | `README-jp.md` のスクリプト表と `package.json` が不一致 | 表にある `dev` / `lint` / `docker:build` / `docker:run` は `package.json` に無い。ESLint 自体も未導入 |
| P1-4 | `package.json` の `format` が存在しないパスを対象 | `"projects/**/*.{ts,vue,html}"`。`boilerplate/**` が対象外になっている |
| P1-5 | clasp 系スクリプトが無い | `@google/clasp` は devDependencies にあるが `push` / `pull` / `deploy` / `open` のスクリプトが未定義。テンプレートの価値が半減 |
| P1-6 | ビルド成果物が git 管理下 | `boilerplate/*/dist/**` が 13 ファイル追跡されている（`.gitignore` は `/dist` のみ＝ルート限定）。stale な `backend.js` / `sendmail.html` が混入 |
| P1-7 | `README.md`（GitHub 既定表示）が無い | `README-jp.md` のみのため、リポジトリトップに説明が出ない |

### P2 — 品質・保守性（テンプレートとしての完成度）

| # | 課題 | 詳細 |
| :-- | :--- | :--- |
| P2-1 | バックエンド共通コードが 4 重複 | `sample-be-only` / `sample-vanilla` / `sample-vue` の `src/backend` は**バイト単位で完全一致**（`diff -rq` で差分ゼロ）。さらにルート `src/backend` が微妙に分岐した 4 つ目のコピー。共通サービスの修正が 4 箱所に波及する |
| P2-2 | `infrastructure` がどのひな型からも未使用 | `schema.ts` の `SCHEMA` / `TRIGGERS` / `PROPERTIES` を使う導線（`index.ts` からの `setupInfrastructure()` 露出）が無く、機能として到達不能 |
| P2-3 | `ApiResponse<T>` の型が二重定義・仕様不一致 | `@types/global.d.ts` は判別可能ユニオン（`error: AppError`）、`boilerplate/sample-vue/src/frontend/src/types/api.ts` は `success: boolean` + `error?: string`。フロント/バックで契約がずれる |
| P2-4 | 案件固有コードがテンプレートに残留 | `worksheetfunctions/worksheetfunction.ts`（`"現物あり"` / 列番号 12,13,14 のハードコード）、`@types/job2.d.ts`（Jobcan 固有 259 行）、`@types/gchat.d.ts` の業務前提 |
| P2-5 | `worksheetfunction.ts` が自らのルール違反 | `export function onEdit(...)` はバンドル後 GAS から認識されない。`.cursorrules` が定める「`global` へのアタッチ必須」に反する悪い例が同梱されている |
| P2-6 | サンプルが `console.log` を使用 | `sampleService.ts` / `sampleApi.ts`。`CLAUDE.md`・`.antigravityrules` の「`LoggerService` 徹底」に反する |
| P2-7 | `build.js` のフロント有無判定が不正確 | `hasFrontend = existsSync(src/frontend) || existsSync(vite.config.ts)`。`vite.config.ts` は常に存在するため、BE-only 構成でも必ず Vite が走って失敗する |
| P2-8 | `tsconfig.json` に `include` が無い | `boilerplate/**` 全体（ひな型＝未使用コード）が型チェック対象。`.vue` は `vue-tsc` 未導入のため実質未検査 |
| P2-9 | CI が無い | `.github/` が存在しない。build / typecheck / test の回帰を検知できない |
| P2-10 | Lint が無い | ESLint 未導入（devcontainer は `dbaeumer.vscode-eslint` を推奨し、README は `lint` スクリプトを掲載） |
| P2-11 | Docker / devcontainer が旧構成前提 | `Dockerfile` に「template package.jsons をコピーすべき」旨の旧コメント、`npm install` 実行が無く実質 `bash` のみ。`docker-compose.yml` は `~/.clasprc.json` を必須マウント（未存在時に起動失敗の恐れ） |
| P2-12 | 依存の更新・脆弱性 | `npm ci` 時点で 13 件（high 6 / moderate 6 / low 1）。`@google/clasp` は `^2.4.2` で世代が古い |
| P2-13 | LICENSE / CONTRIBUTING / PR テンプレートが無い | 社内テンプレートとしての利用ルールが不明 |

---

## 4. 目指す姿の選択

現状は「単一プロジェクト構成（A）」と「マルチプロジェクト構成（B）」の残骸が混在しています。まずここを決めないと、どの修正も筋が通りません。

| | A: 単一プロジェクト特化 | B: `projects/` マルチ構成に回帰 |
| :--- | :--- | :--- |
| 概要 | ルート `src/` が唯一の実装場所。`boilerplate/` は「コピー元カタログ」 | `projects/<name>/` 配下に複数 GAS を並置し `PROJECT` で切替 |
| 修正量 | 小（`esbuild.js` / `vite.config.ts` の `PROJECT` 依存を外すだけ） | 中〜大（`build.js` の全面書き換え、`projects/` 新設、`.clasp.json` の複数管理） |
| 既存ドキュメントとの整合 | ◎（`README-jp.md`・`.antigravityrules`・`CLAUDE.md` はすべて A 前提） | ✗（3 つのドキュメントを書き換える必要あり） |
| clasp 運用 | 単純（ルート 1 つの `.clasp.json`） | 煩雑（プロジェクト毎に `.clasp.json` と切替スクリプト） |
| 用途 | 1 案件 = 1 リポジトリ（`Use this template` 前提） | 1 リポジトリで複数 GAS を横断管理 |

### 推奨: **A（単一プロジェクト特化）**

理由:

1. 既存ドキュメント 3 種すべてが A を前提に書かれており、**A を選べば「コードを直す」だけで済む**（B はドキュメント全書き換えが伴う）。
2. GAS は `.clasp.json` = スクリプト 1 つの 1:1 対応が基本で、マルチ構成は運用が複雑化しやすい。
3. GitHub の `Use this template` と相性が良く、案件ごとに独立したリポジトリ・独立した CI を持てる。
4. `boilerplate/` を「起動時に選ぶひな型カタログ」と割り切れば、マルチ構成の利点（複数パターンの同居）は失われない。

以降の提案はすべて **A 前提** で記述します。

---

## 5. 具体的な実装提案

### 5-1. `esbuild.js` — `PROJECT` 依存を撤去（P0-1）

```js
import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";
import fs from "fs";

const entryPoint = "./src/backend/index.ts";
if (!fs.existsSync(entryPoint)) {
  console.error(`エラー: エントリポイントが見つかりません: ${entryPoint}`);
  console.error("boilerplate/ からひな型をコピーしてください（npm run init:be 等）。");
  process.exit(1);
}

esbuild
  .build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: false,
    outfile: "./dist/backend.js",
    target: "ES2019",
    plugins: [GasPlugin],
    legalComments: "inline",
    charset: "utf8",
  })
  .catch((e) => {
    console.error("Esbuild ビルドエラー:", e);
    process.exit(1);
  });
```

未使用の `import { resolve } from "path"` も削除します。

### 5-2. `vite.config.ts` — `PROJECT` 依存を撤去し、フロント種別を自動判定（P0-1 / P2-7）

```ts
const root = resolve(__dirname, "src/frontend");
const outDir = resolve(__dirname, "dist");

// FRONTEND 未指定時は App.vue の有無で自動判定
const frontendType =
  process.env.FRONTEND ?? (existsSync(resolve(root, "src/App.vue")) ? "vue" : "vanilla");
```

`build.js` 側のフロント有無判定も、`vite.config.ts` の存在ではなく **`src/frontend/index.html` の存在**で行うよう変更します（BE-only 構成で Vite を空振りさせないため）。

### 5-3. `src/backend/index.ts` の新規作成（P0-3 / P2-2）

「共通コード置き場」で終わっている `src/` に、**動く最小のエントリポイント**を置きます。DI コンテナと `infrastructure` を実際に結線し、テンプレートの機能が到達可能な状態にします。

```ts
import { Container } from "./core/container";
import { LoggerService } from "./services/LoggerService";
import { MailService } from "./services/MailService";
import { setupInfrastructure } from "./infrastructure/installer/installer";
import { validateInfrastructure } from "./infrastructure/validator/validator";

Container.register("logger", LoggerService);
Container.register("mail", MailService);

// --- GAS から呼び出されるグローバル関数 ---
(global as any).onOpen = () => {
  SpreadsheetApp.getUi()
    .createMenu("管理メニュー")
    .addItem("初期セットアップ", "setup")
    .addItem("構成チェック", "validate")
    .addToUi();
};

/** シート・トリガー・スクリプトプロパティを schema.ts から自動生成 */
(global as any).setup = () => {
  setupInfrastructure();
  LoggerService.info("初期セットアップが完了しました。");
};

/** 現在のスプレッドシート構成が schema.ts と一致するか検証 */
(global as any).validate = () => {
  validateInfrastructure();
  LoggerService.info("構成チェックに合格しました。");
};
```

あわせて `@types/global.d.ts` の `AppsScriptApi` に `setup` / `validate` を追記します。

### 5-4. 共通コードの単一化（P2-1）

現状 4 コピーある `LoggerService` / `MailService` / `SheetRepository` / `IRepository` / `container` を **ルート `src/backend/` を唯一の正**とし、`boilerplate/sample-*/src/backend/` からは削除します。`boilerplate/` に残すのは「そのひな型固有のもの」だけにします。

```text
boilerplate/sample-vue/
├── appsscript.json
└── src/
    ├── backend/index.ts            # エントリポイントのみ（共通層は import しない前提のひな型）
    └── frontend/**                 # Vue 固有
```

そのうえで「ひな型の適用」をスクリプト化し、`README-jp.md` の手動 `cp` 手順を置き換えます。

```json
"init:be":      "node scripts/init.js sample-be-only",
"init:vanilla": "node scripts/init.js sample-vanilla",
"init:vue":     "node scripts/init.js sample-vue",
"init:onetime": "node scripts/init.js sample-one-time"
```

`scripts/init.js` の責務: 指定ひな型の `src/**` をルート `src/` へ、`appsscript.json` をルートへコピー。**既存ファイルがある場合は上書きせず警告**（README の「上書き注意」を仕組みで担保）。

### 5-5. `infrastructure` の格上げ（P0-5 / P2-2）

import パスを修正（`../../schema/schema` → `../schema/schema`、`./schema` → `../schema/schema`）した上で、`boilerplate/infrastructure/` → **`src/backend/infrastructure/`** へ移動し、共通機能として常時使えるようにします。ここはテンプレートの差別化要素なので、次期実装で以下まで踏み込む価値があります。

- `ConfigRepository` を `Container` に登録し、`SCHEMA.CONFIG` 経由の設定取得を標準化
- `schema.ts` の `SCHEMA` から `SheetRepository<T>` の型を導出（`columns` と `T` のキーの整合を型で保証）
- `installer` の冪等性テスト（Jest + `SpreadsheetApp` モック）
- `TRIGGERS` の `atHour(9)` などのハードコードを `TriggerConfig` の任意プロパティに外出し

### 5-6. `package.json` scripts の整備（P1-3 / P1-4 / P1-5）

```json
{
  "dev": "vite",
  "build": "node scripts/build.js",
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
  "typecheck": "tsc --noEmit",
  "lint": "prettier --check \"{src,test,boilerplate,scripts}/**/*.{ts,vue,html,js}\"",
  "format": "prettier --write \"{src,test,boilerplate,scripts}/**/*.{ts,vue,html,js}\"",
  "push": "npm run build && clasp push",
  "deploy": "npm run build && clasp deploy",
  "logs": "clasp logs --watch",
  "open": "clasp open"
}
```

`dev:vue` / `dev:vanilla` は 5-2 の自動判定により `dev` 1 本に統合できます（`FRONTEND=vanilla npm run dev` で明示上書きも可）。

### 5-7. テストの修復と拡充（P0-6）

```ts
import { Container } from "../src/backend/core/container";
```

に修正。加えて次期実装では以下を追加します。

- `Container` の上書き登録・型の取り違えに対する挙動
- `SheetRepository` の `rowToObject` / `objectToRow`（`Sheet` をモックした純ロジック検証）
- `schema.ts` と `validator` の整合テスト

※ `Container.services` が `static` のためテスト間で状態が漏れます。`reset()` を追加し `afterEach` で呼ぶ想定です。

### 5-8. ルート `appsscript.json` の追加（P0-4）

`boilerplate/*/appsscript.json` は 4 種すべて同一内容（Drive v3 / Sheets v4 / STACKDRIVER / V8 / Asia/Tokyo）。ルートに既定値を 1 つ置き、Web App 用の設定はコメント代わりにドキュメント化します。

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": { "enabledAdvancedServices": [] },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

**方針**: 既定は最小権限（`enabledAdvancedServices` を空）とし、Drive / Sheets の有効化やスコープ追加は案件側の判断で行う旨を README に明記します（現状は全ひな型が無条件で Drive+Sheets を要求している）。

### 5-9. `.gitignore` の修正（P1-6）

```diff
-/dist
+dist/
```

そのうえで追跡済みの `boilerplate/*/dist/**`（13 ファイル）を `git rm -r --cached` で管理外にします。ビルド成果物とソースが混在している現状は、`.antigravityrules` の「`dist/` を直接手修正しない」原則の担保としても不適切です。

### 5-10. `tsconfig.json` に `include` を追加（P2-8）

```json
"include": ["src/**/*.ts", "src/**/*.vue", "test/**/*.ts", "@types/**/*.d.ts", "scripts/**/*.js"],
"exclude": ["node_modules", "dist", "boilerplate"]
```

`boilerplate/` は「コピー元」であり、共通層を前提に書かれた `index.ts` を単体で型検査すると解決不能な import が残ります。**ひな型の健全性は CI 側で「コピーしてビルドが通るか」で担保**する方針（5-11）に切り替えます。

### 5-11. CI の新設（P2-9）

`.github/workflows/ci.yml`:

- **job: verify** — `npm ci` → `npm run typecheck` → `npm test` → `npm run lint`
- **job: boilerplate-matrix** — `[sample-be-only, sample-vanilla, sample-vue, sample-one-time]` の matrix で
  `node scripts/init.js <name>` → `npm run build` → `dist/backend.js` と `dist/appsscript.json` の生成を確認

2 つ目の job が今回のような「ビルドが壊れたまま気づかない」状態の再発防止になります。**P0 修正と同時に入れるべき**項目です。

### 5-12. ドキュメントの同期（P1-1 / P1-2 / P1-7）

- `CLAUDE.md`: 構造図を実測（本ドキュメント §1）に合わせ、`boilerplate/` の役割と `init:*` の導線を追記
- `README-jp.md`: `templates/` → `boilerplate/`、手動 `cp` → `npm run init:*`、スクリプト表を `package.json` の実態に一致させる。WSL の絶対パス記述は環境依存なので削除
- `README.md`（英語 or 日本語の要約）を新規作成し、`README-jp.md` へリンク
- `plan.md`: `projects/[プロジェクト名]/` 前提の記述を単一プロジェクト前提に修正

### 5-13. 案件固有コードの分離（P2-4 / P2-5）

- `worksheetfunctions/worksheetfunction.ts`: 案件固有ロジックのため削除。GAS のシートトリガーの書き方を示す例が必要なら、`global` アタッチ方式の最小サンプルに置き換える（現状は「認識されない書き方」の悪例）
- `@types/job2.d.ts`（Jobcan）/ `@types/gchat.d.ts`: `@types/` 直下から外し、`boilerplate/types/`（オプトインで `cp` する型カタログ）へ移動。テンプレート既定では読み込まない

---

## 6. ロードマップと完了条件

### Phase 1 — 一貫性の回復（P0、目安 0.5〜1 日）

- [ ] `esbuild.js` / `vite.config.ts` の `PROJECT` 依存を撤去（5-1 / 5-2）
- [ ] `src/backend/index.ts` を新規作成（5-3）
- [ ] ルート `appsscript.json` を追加（5-8）
- [ ] `infrastructure` の import パス修正（5-5 前半）
- [ ] `test/container.test.ts` の参照先修正（5-7）
- [ ] **DoD**: `npm run build` / `npm run typecheck` / `npm test` がすべて成功し、`dist/backend.js` と `dist/appsscript.json` が生成される

### Phase 2 — テンプレート導線と CI（P1、目安 1 日）

- [ ] `scripts/init.js` と `init:*` スクリプト（5-4）
- [ ] clasp / lint スクリプトの追加（5-6）
- [ ] `.gitignore` 修正 + 追跡済み `dist` の除去（5-9）
- [ ] `tsconfig.json` に `include` / `exclude`（5-10）
- [ ] CI ワークフロー 2 job（5-11）
- [ ] ドキュメント同期（5-12）
- [ ] **DoD**: clone → `npm ci` → `npm run init:vue` → `npm run build` が README の記述どおりに完走し、CI が緑

### Phase 3 — 中身の品質（P2、目安 2〜3 日）

- [ ] 共通コードの単一化（4 コピーの解消、5-4）
- [ ] `infrastructure` を `src/backend/` へ格上げし DI 結線 + テスト（5-5）
- [ ] `ApiResponse<T>` の定義を `@types/global.d.ts` に一本化（P2-3）
- [ ] 案件固有コード・型の分離（5-13）
- [ ] サンプルの `console.log` → `LoggerService`（P2-6）
- [ ] ESLint 導入（`@typescript-eslint` + `eslint-plugin-vue`）(P2-10)
- [ ] Docker / devcontainer を現構成に追従（P2-11）
- [ ] 依存更新と `npm audit` 対応、`@google/clasp` の世代確認（P2-12）
- [ ] LICENSE / CONTRIBUTING / PR テンプレート（P2-13）

---

## 7. 決めておきたいこと（レビュー時の論点）

1. **§4 の A / B 選択**: 本提案は A（単一プロジェクト特化）前提。B を採るなら Phase 1 の内容が変わります。
2. **`boilerplate/` の扱い**: 「コピー元カタログ」（本提案）か、「共通層を import して動く実プロジェクト群」か。後者なら共通層を npm workspaces / path alias で参照する設計が必要です。
3. **`infrastructure` の投資判断**: schema 駆動の自動セットアップはこのテンプレート最大の差別化要素になり得ます。Phase 3 ではなく Phase 2 に前倒しする価値があるか。
4. **`appsscript.json` の既定スコープ**: 最小権限（本提案）か、Drive+Sheets 有効の現状踏襲か。
5. **AI エージェント向けルールの一元化**: `CLAUDE.md` / `.cursorrules` / `.antigravityrules` は内容が大きく重複しています。共通部分を 1 ファイル（例: `docs/ai-guidelines.md`）に集約し、各ファイルから参照する形にすると、今回のような「ドキュメントだけ古い」事態を防げます。

---

## 付録: 検証コマンドと環境

```bash
node -v   # v22.22.2
npm ci    # 573 packages / 13 vulnerabilities (high 6, moderate 6, low 1)
npm run typecheck   # → 4 errors (TS2307 x4)
npm test            # → 1 failed suite / 0 tests
npm run build       # → Vite config load error (PROJECT 未定義)
```

補足: `diff -rq boilerplate/sample-vue/src/backend boilerplate/sample-vanilla/src/backend` および
`diff -rq boilerplate/sample-vue/src/backend boilerplate/sample-be-only/src/backend` はいずれも**差分ゼロ**（P2-1 の根拠）。
