import { SCHEMA } from "./schema";

export class ConfigRepository {
  private readonly configMap: Map<string, string> = new Map<string, string>();

  constructor() {
    const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName: string = SCHEMA.CONFIG.sheetName;
    const sheet: GoogleAppsScript.Spreadsheet.Sheet | null = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Config sheet '${sheetName}' does not exist.`);
    }

    const lastRow: number = sheet.getLastRow();
    if (lastRow <= 1) {
      return;
    }

    const lastColumn: number = sheet.getLastColumn();
    const headers: string[] = sheet.getRange(1, 1, 1, lastColumn).getValues()[0] as string[];
    const keyIndex: number = headers.indexOf('key');
    const valueIndex: number = headers.indexOf('value');

    if (keyIndex === -1 || valueIndex === -1) {
      throw new Error("Config sheet headers must contain 'key' and 'value'.");
    }

    const data: (string | number | boolean | Date)[][] = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues() as (string | number | boolean | Date)[][];
    for (const row of data) {
      const key: string = String(row[keyIndex]);
      const value: string = String(row[valueIndex]);
      if (key) {
        this.configMap.set(key, value);
      }
    }
  }

  get(key: string): string {
    const value: string | undefined = this.configMap.get(key);
    if (value === undefined) {
      throw new Error(`Config key '${key}' not found.`);
    }
    return value;
  }
}
