/**
 * @description ログ管理ビジネスロジック (共通共有版)
 * @author yoshitaka
 * @export
 * @class LoggerService
 */
export class LoggerService {
  private static readonly TAG = "[App]";

  /**
   * 情報ログ
   */
  static info(message: string, data?: any): void {
    const log = data
      ? `${this.TAG} [INFO] ${message} ${JSON.stringify(data)}`
      : `${this.TAG} [INFO] ${message}`;
    Logger.log(log);
  }

  /**
   * 警告ログ
   */
  static warn(message: string, data?: any): void {
    const log = data
      ? `${this.TAG} [WARN] ${message} ${JSON.stringify(data)}`
      : `${this.TAG} [WARN] ${message}`;
    Logger.log(log);
  }

  /**
   * エラーログ
   */
  static error(message: string, error?: any): void {
    const log = error
      ? `${this.TAG} [ERROR] ${message} ${JSON.stringify(error)}`
      : `${this.TAG} [ERROR] ${message}`;
    Logger.log(log);
  }

  /**
   * デバッグログ
   */
  static debug(message: string, data?: any): void {
    const log = data
      ? `${this.TAG} [DEBUG] ${message} ${JSON.stringify(data)}`
      : `${this.TAG} [DEBUG] ${message}`;
    Logger.log(log);
  }
}
