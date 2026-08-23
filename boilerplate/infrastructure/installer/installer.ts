import {
  CONFIG_INITIAL_VALUES,
  PROPERTIES,
  SCHEMA,
  SheetConfig,
  TRIGGERS,
} from "../schema/schema";

export function setupSpreadsheet(): void {
  const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  for (const key of Object.keys(SCHEMA) as Array<keyof typeof SCHEMA>) {
    const config: SheetConfig = SCHEMA[key];
    let sheet: GoogleAppsScript.Spreadsheet.Sheet | null = spreadsheet.getSheetByName(
      config.sheetName,
    );
    if (!sheet) {
      sheet = spreadsheet.insertSheet(config.sheetName);
    }

    const columns: readonly string[] = config.columns;
    const headerRange: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(1, 1, 1, columns.length);
    headerRange.setValues([Array.from(columns)]);
  }

  const configSheetName: string = SCHEMA.CONFIG.sheetName;
  const configSheet: GoogleAppsScript.Spreadsheet.Sheet | null =
    spreadsheet.getSheetByName(configSheetName);
  if (configSheet) {
    const lastRow: number = configSheet.getLastRow();
    const existingKeys: Set<string> = new Set<string>();

    if (lastRow > 1) {
      const lastColumn: number = configSheet.getLastColumn();
      const headers: string[] = configSheet
        .getRange(1, 1, 1, lastColumn)
        .getValues()[0] as string[];
      const keyIndex: number = headers.indexOf("key");
      if (keyIndex !== -1) {
        const data: (string | number | boolean | Date)[][] = configSheet
          .getRange(2, 1, lastRow - 1, lastColumn)
          .getValues() as (string | number | boolean | Date)[][];
        for (const row of data) {
          const key: string = String(row[keyIndex]);
          if (key) {
            existingKeys.add(key);
          }
        }
      }
    }

    const headers: string[] = configSheet
      .getRange(1, 1, 1, configSheet.getLastColumn())
      .getValues()[0] as string[];
    const keyIndex: number = headers.indexOf("key");
    const valueIndex: number = headers.indexOf("value");
    const descIndex: number = headers.indexOf("description");

    for (const initVal of CONFIG_INITIAL_VALUES) {
      if (!existingKeys.has(initVal.key)) {
        const rowData: string[] = new Array<string>(headers.length).fill("");
        if (keyIndex !== -1) {
          rowData[keyIndex] = initVal.key;
        }
        if (valueIndex !== -1) {
          rowData[valueIndex] = initVal.value;
        }
        if (descIndex !== -1) {
          rowData[descIndex] = initVal.description;
        }
        configSheet.appendRow(rowData);
      }
    }
  }
}

export function setupTriggers(): void {
  const existingTriggers: GoogleAppsScript.Script.Trigger[] = ScriptApp.getProjectTriggers();

  for (const trig of TRIGGERS) {
    for (const extTrig of existingTriggers) {
      if (extTrig.getHandlerFunction() === trig.functionName) {
        ScriptApp.deleteTrigger(extTrig);
      }
    }

    if (trig.eventType === "CLOCK") {
      const clockTrigger: GoogleAppsScript.Script.ClockTriggerBuilder = ScriptApp.newTrigger(
        trig.functionName,
      ).timeBased();
      if (trig.schedule === "DAILY") {
        clockTrigger.everyDays(1).atHour(9).create();
      } else if (trig.schedule === "HOURLY") {
        clockTrigger.everyHours(1).create();
      } else {
        clockTrigger.everyDays(1).create();
      }
    } else if (trig.eventType === "SPREADSHEET") {
      const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
        SpreadsheetApp.getActiveSpreadsheet();
      if (trig.schedule === "ON_EDIT") {
        ScriptApp.newTrigger(trig.functionName).forSpreadsheet(spreadsheet).onEdit().create();
      } else if (trig.schedule === "ON_OPEN") {
        ScriptApp.newTrigger(trig.functionName).forSpreadsheet(spreadsheet).onOpen().create();
      }
    }
  }
}

export function setupProperties(): void {
  const scriptProperties: GoogleAppsScript.Properties.Properties =
    PropertiesService.getScriptProperties();
  scriptProperties.setProperties(PROPERTIES);
}

export function setupInfrastructure(): void {
  setupSpreadsheet();
  setupTriggers();
  setupProperties();
}
