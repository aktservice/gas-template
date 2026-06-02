/**
 * @description 型定義ファイル
 * @author yoshitaka
 */

/**
 * API レスポンス汎用型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * API リクエストパラメータ
 */
export interface ApiRequestParams {
  [key: string]: any;
}
