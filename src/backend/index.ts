/**
 * @description バックエンドのエントリポイント。
 *              esbuild はこのファイルを起点に dist/backend.js を生成する。
 *
 * GAS のトリガー・メニュー・シート上のボタンから呼び出す関数は、
 * バンドル後も認識されるよう必ず `global` へ明示的にアタッチすること。
 * （トップレベルの `function foo() {}` や `export function foo()` は
 *   バンドラを経由すると GAS から見えないため動作しない）
 */
import { Container } from "./core/container";
import { LoggerService } from "./services/LoggerService";
import { MailService } from "./services/MailService";

// --- DI コンテナへの登録 ---
Container.register("logger", LoggerService);
Container.register("mail", MailService);

// --- GAS から呼び出されるグローバル関数 ---

/**
 * スプレッドシート起動時にカスタムメニューを追加する。
 */
(global as any).onOpen = (): void => {
  SpreadsheetApp.getUi().createMenu("実行メニュー").addItem("実行", "executeMain").addToUi();
};

/**
 * メインの実行関数。実際の処理は services/ 配下に実装し、ここでは呼び出しのみ行う。
 */
(global as any).executeMain = (): void => {
  const logger = Container.get<typeof LoggerService>("logger");
  logger.info("executeMain を開始しました。");

  // TODO: ここに処理を実装する
  //   例) new SheetRepository<Order>("orders").getAll()
  //       Container.get<typeof MailService>("mail").send(to, subject, body);

  logger.info("executeMain が正常に完了しました。");
};
