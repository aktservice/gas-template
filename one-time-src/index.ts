/**
 * One-time script example
 * Use this for quick backend tasks.
 */

(global as any).runOneTimeTask = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // Magic numbers and quick logic
  const data = sheet.getRange("A1:B10").getValues();
  Logger.log("Processing one-time task...");
  Logger.log(data);
};
