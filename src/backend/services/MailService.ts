/**
 * @description メール送信ビジネスロジック (共通共有版)
 * @author yoshitaka
 * @export
 * @class MailService
 */
export class MailService {
  /**
   * メール送信
   * @param to 宛先
   * @param subject 件名
   * @param body 本文
   */
  static send(to: string, subject: string, body: string): void {
    try {
      GmailApp.sendEmail(to, subject, body);
      Logger.log(`メール送信成功: ${to}`);
    } catch (error) {
      Logger.log(`メール送信失敗: ${error}`);
      throw new Error(`メール送信に失敗しました: ${error}`);
    }
  }

  /**
   * HTMLメール送信
   * @param to 宛先
   * @param subject 件名
   * @param htmlBody HTML本文
   */
  static sendHtml(to: string, subject: string, htmlBody: string): void {
    try {
      GmailApp.sendEmail(to, subject, "", {
        htmlBody: htmlBody,
      });
      Logger.log(`HTMLメール送信成功: ${to}`);
    } catch (error) {
      Logger.log(`HTMLメール送信失敗: ${error}`);
      throw new Error(`HTMLメール送信に失敗しました: ${error}`);
    }
  }

  /**
   * テンプレートメール送信
   * @param to 宛先
   * @param templateName テンプレート名
   * @param data テンプレート変数
   */
  static sendFromTemplate(to: string, templateName: string, data: Record<string, string>): void {
    try {
      const template = HtmlService.createTemplateFromFile(templateName);
      Object.assign(template, data);
      const htmlBody = template.evaluate().getContent();
      this.sendHtml(to, data.subject || templateName, htmlBody);
    } catch (error) {
      Logger.log(`テンプレートメール送信失敗: ${error}`);
      throw new Error(`テンプレートメール送信に失敗しました: ${error}`);
    }
  }
}
