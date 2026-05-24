import { LoggerService } from "../services/LoggerService";

/**
 * @description GAS Web App API に対して HTTP リクエストを行うための共通 API クライアント
 * @class GasApiClient
 */
export class GasApiClient {
  private webAppUrl: string;

  /**
   * @param {string} webAppUrl 接続先となる GAS Web App のデプロイ済み URL (https://script.google.com/macros/s/.../exec)
   */
  constructor(webAppUrl: string) {
    if (!webAppUrl) {
      throw new Error("GasApiClient の初期化には有効な webAppUrl が必要です。");
    }
    this.webAppUrl = webAppUrl;
  }

  /**
   * クエリパラメータ付き GET リクエストの送信
   * @param {Record<string, string | number | boolean>} [params] クエリパラメータのオブジェクト
   * @returns {T} パースされたレスポンスデータ
   */
  public get<T>(params?: Record<string, string | number | boolean>): T {
    let targetUrl = this.webAppUrl;

    if (params) {
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
        .join("&");
      targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
    }

    LoggerService.info(`GasApiClient GET リクエスト開始: ${targetUrl}`);

    try {
      const response = UrlFetchApp.fetch(targetUrl, {
        method: "get",
        muteHttpExceptions: true,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      LoggerService.error(`GasApiClient GET リクエストに失敗: ${error}`);
      throw new Error(`APIリクエストエラー: ${error}`);
    }
  }

  /**
   * JSONペイロード付き POST リクエストの送信
   * @param {any} payload 送信する JSON データ
   * @returns {T} パースされたレスポンスデータ
   */
  public post<T>(payload: any): T {
    LoggerService.info(`GasApiClient POST リクエスト開始: ${this.webAppUrl}`);

    try {
      const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      };

      const response = UrlFetchApp.fetch(this.webAppUrl, options);
      return this.handleResponse<T>(response);
    } catch (error) {
      LoggerService.error(`GasApiClient POST リクエストに失敗: ${error}`);
      throw new Error(`APIリクエストエラー: ${error}`);
    }
  }

  /**
   * HTTP レスポンスの共通ハンドリングと JSON パース
   */
  private handleResponse<T>(response: GoogleAppsScript.URL_Fetch.HTTPResponse): T {
    const code = response.getResponseCode();
    const content = response.getContentText();

    LoggerService.info(`GasApiClient レスポンスステータス: ${code}`);

    if (code >= 200 && code < 300) {
      try {
        return JSON.parse(content) as T;
      } catch (e) {
        LoggerService.warn(`レスポンスの JSON パースに失敗したため、生のテキストを返します。`);
        return content as unknown as T;
      }
    } else {
      const errorMsg = `HTTPエラーステータス ${code}: ${content}`;
      LoggerService.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
}
