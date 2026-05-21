/**
 * @description API通信クライアント
 * @author yoshitaka
 */

import { ApiResponse } from "../types/api";

/**
 * GASバックエンドへのAPI呼び出し
 */
export class ApiClient {
  /**
   * GET リクエスト
   */
  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "通信エラー",
      };
    }
  }

  /**
   * POST リクエスト
   */
  static async post<T = any>(
    endpoint: string,
    payload: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "通信エラー",
      };
    }
  }

  /**
   * GAS側の google.script.run を使用した呼び出し
   */
  static async callGasFunction<T = any>(
    functionName: string,
    ...args: any[]
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      if (typeof google === "undefined" || !google.script.run) {
        resolve({
          success: false,
          error: "GAS環境が初期化されていません",
        });
        return;
      }

      (google.script.run as any)
        .withSuccessHandler((result: any) => {
          resolve({
            success: true,
            data: result as T,
          });
        })
        .withFailureHandler((error: any) => {
          resolve({
            success: false,
            error: error || "GAS関数実行エラー",
          });
        })
        [functionName](...args);
    });
  }
}
