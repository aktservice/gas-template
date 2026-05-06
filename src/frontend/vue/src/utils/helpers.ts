/**
 * @description ユーティリティ関数
 * @author yoshitaka
 */

/**
 * ローカルストレージから値を取得
 */
export function getStorage<T = any>(key: string, defaultValue?: T): T | null {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue ?? null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return item as any;
  }
}

/**
 * ローカルストレージに値を保存
 */
export function setStorage(key: string, value: any): void {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }
}

/**
 * エラーメッセージを整形
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "不明なエラーが発生しました";
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}
