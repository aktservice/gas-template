var global = this;
function onOpen() {
}
function excuteMain() {
}
"use strict";
(() => {
  // projects/sample-vue/src/backend/services/sampleService.ts
  var SampleService = class {
    constructor() {
    }
    execute() {
      console.log("SampleService is working");
    }
  };

  // projects/sample-vue/src/backend/index.ts
  var sampleService = new SampleService();
  global.onOpen = () => {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("実行メニュー").addItem("実行", "excuteMain").addToUi();
  };
  global.excuteMain = () => {
    sampleService.execute();
  };
})();
