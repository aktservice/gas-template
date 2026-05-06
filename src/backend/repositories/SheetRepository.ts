import { IRepository } from "./IRepository";

/**
 * @description Google Sheets データアクセス層
 * @author yoshitaka
 * @export
 * @class SheetRepository
 * @template T
 */
export class SheetRepository<T extends Record<string, any>> implements IRepository<T> {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private headers: string[] = [];

  constructor(sheetName: string) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = spreadsheet.getSheetByName(sheetName)!;
    this.loadHeaders();
  }

  /**
   * ヘッダー行を読み込み
   */
  private loadHeaders(): void {
    const headerRow = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn());
    this.headers = headerRow.getValues()[0] as string[];
  }

  /**
   * 行データをオブジェクトに変換
   */
  private rowToObject(row: any[]): T {
    const obj: Record<string, any> = {};
    this.headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj as T;
  }

  /**
   * オブジェクトを行データに変換
   */
  private objectToRow(entity: T): any[] {
    return this.headers.map((header) => entity[header] ?? "");
  }

  getAll(): T[] {
    const dataRange = this.sheet.getRange(
      2,
      1,
      this.sheet.getLastRow() - 1,
      this.sheet.getLastColumn(),
    );
    const values = dataRange.getValues();
    return values.map((row) => this.rowToObject(row));
  }

  getById(id: string | number): T | null {
    const data = this.getAll();
    return data.find((item) => item.id === id) || null;
  }

  create(entity: T): void {
    const row = this.objectToRow(entity);
    this.sheet.appendRow(row);
  }

  update(id: string | number, entity: Partial<T>): void {
    const data = this.getAll();
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
      const updated = { ...data[index], ...entity };
      const row = this.objectToRow(updated as T);
      this.sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
    }
  }

  delete(id: string | number): void {
    const data = this.getAll();
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.sheet.deleteRow(index + 2);
    }
  }
}
