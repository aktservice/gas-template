import { SCHEMA, CONFIG_INITIAL_VALUES, SheetConfig } from "../schema/schema";

export function validateInfrastructure(): void {
  const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  for (const key of Object.keys(SCHEMA) as Array<keyof typeof SCHEMA>) {
    const config: SheetConfig = SCHEMA[key];
    const sheet: GoogleAppsScript.Spreadsheet.Sheet | null = spreadsheet.getSheetByName(
      config.sheetName,
    );
    if (!sheet) {
      throw new Error(`Validation Error: Sheet '${config.sheetName}' does not exist.`);
    }

    const lastColumn: number = sheet.getLastColumn();
    if (lastColumn === 0 && config.columns.length > 0) {
      throw new Error(
        `Validation Error: Sheet '${config.sheetName}' has no columns, expected: ${config.columns.join(", ")}`,
      );
    }

    const headers: string[] = sheet.getRange(1, 1, 1, lastColumn).getValues()[0] as string[];
    for (const expectedCol of config.columns) {
      if (headers.indexOf(expectedCol) === -1) {
        throw new Error(
          `Validation Error: Sheet '${config.sheetName}' is missing column '${expectedCol}'.`,
        );
      }
    }
  }

  const configSheetName: string = SCHEMA.CONFIG.sheetName;
  const configSheet: GoogleAppsScript.Spreadsheet.Sheet | null =
    spreadsheet.getSheetByName(configSheetName);
  if (!configSheet) {
    throw new Error(`Validation Error: Config sheet '${configSheetName}' does not exist.`);
  }

  const lastRow: number = configSheet.getLastRow();
  const lastCol: number = configSheet.getLastColumn();
  const headers: string[] = configSheet.getRange(1, 1, 1, lastCol).getValues()[0] as string[];
  const keyIndex: number = headers.indexOf("key");
  if (keyIndex === -1) {
    throw new Error("Validation Error: Config sheet is missing 'key' column.");
  }

  const existingKeys: Set<string> = new Set<string>();
  if (lastRow > 1) {
    const data: (string | number | boolean | Date)[][] = configSheet
      .getRange(2, 1, lastRow - 1, lastCol)
      .getValues() as (string | number | boolean | Date)[][];
    for (const row of data) {
      const key: string = String(row[keyIndex]);
      if (key) {
        existingKeys.add(key);
      }
    }
  }

  for (const initVal of CONFIG_INITIAL_VALUES) {
    if (!existingKeys.has(initVal.key)) {
      throw new Error(
        `Validation Error: Config key '${initVal.key}' is missing from the config sheet.`,
      );
    }
  }
}
