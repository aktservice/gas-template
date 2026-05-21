import { SampleService } from "./services/sampleService";
import { SampleApi } from "./api/sampleApi";
import { SampleConfig } from "./property-config/sampleConfig";

// インスタンスの生成（DIの簡易版）
const sampleService = new SampleService();

/**
 * GASから呼び出されるグローバル関数
 */
(global as any).onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("実行メニュー").addItem("実行", "excuteMain").addToUi();
};

(global as any).excuteMain = () => {
  sampleService.execute();
};
