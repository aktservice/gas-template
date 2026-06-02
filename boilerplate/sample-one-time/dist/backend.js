var global = this;
// projects/sample-one-time/src/backend/index.ts
function runOneTimeTask() {
}
"use strict";
(() => {
  // projects/sample-one-time/src/backend/index.ts
  global.runOneTimeTask = () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const data = sheet.getRange("A1:B10").getValues();
    Logger.log("Processing one-time task...");
    Logger.log(data);
  };
})();
