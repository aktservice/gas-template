/**
 * クライアントから送信されるファイルデータの構造定義
 */
interface FilePayload {
  fileName: string;
  mimeType: string;
  base64Data: string;
}

/**
 * 汎用ファイルアップローダー・クラス
 */
class UniversalFileUploader {
  private folderId: string | null = null;

  /**
   * @param configSheetName 設定情報の入ったシート名
   * @param configRange フォルダIDが記載されているセル範囲
   */
  constructor(
    private configSheetName: string = "config",
    private configRange: string = "A2",
  ) {}

  /**
   * ダイアログを表示する
   * @param functionName HTML側から呼び出すGASの関数名（グローバルに定義したラッパー名）
   */
  public show(functionName: string = "dataAddFile"): void {
    const htmlString = this.getHtmlTemplate(functionName);
    const htmlOutput = HtmlService.createHtmlOutput(htmlString)
      .setWidth(400)
      .setHeight(300)
      .setTitle("ファイルアップロード");

    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "アップロード");
  }

  /**
   * フォルダIDを解決する
   */
  public resolveFolderId(): string {
    if (this.folderId) return this.folderId;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(this.configSheetName);
    if (!sh) throw new Error(`Sheet "${this.configSheetName}" not found.`);

    const id = sh.getRange(this.configRange).getValue() as string;
    if (!id) throw new Error("Folder ID is empty in config sheet.");

    this.folderId = id;
    return id;
  }

  /**
   * アップロードの実行コアロジック
   */
  public upload(payload: FilePayload): string {
    const folderId = this.resolveFolderId();
    const destFolder = DriveApp.getFolderById(folderId);

    // Base64からBlobを作成
    const decoded = Utilities.base64Decode(payload.base64Data);
    const blob = Utilities.newBlob(decoded, payload.mimeType, payload.fileName);

    // ファイル作成と保存
    const file = destFolder.createFile(blob);
    const url = file.getUrl();

    // アクティブセルにURLを書き込み

    return url;
  }

  /**
   * HTMLテンプレートを生成する
   * ${runFuncName} を使って、呼び出すGAS関数名を動的に差し替える
   */
  private getHtmlTemplate(runFuncName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; text-align: center; }
        .box { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #fafafa; }
        .btn {
          background: #1a73e8; color: white; border: none; padding: 12px;
          border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; margin-top: 15px;
        }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        #status { margin-top: 15px; font-size: 12px; color: #666; min-height: 1.5em; }
      </style>
    </head>
    <body>
      <div class="box">
        <input type="file" id="f" style="width: 100%;" />
        <button id="b" class="btn" onclick="exec()">アップロード実行</button>
        <div id="status">ファイルを選択してください</div>
      </div>
      <script>
        function exec() {
          const fEl = document.getElementById('f');
          if(!fEl.files.length) return alert('ファイルを選択してください');

          const btn = document.getElementById('b');
          const st = document.getElementById('status');
          const file = fEl.files[0];

          btn.disabled = true;
          st.innerText = "⏳ 処理中...";

          const reader = new FileReader();
          reader.onload = function(e) {
            const payload = {
              fileName: file.name,
              mimeType: file.type,
              base64Data: e.target.result.split(',')[1]
            };

            // 動的に差し替えられた関数名を呼び出し
            google.script.run
              .withSuccessHandler(url => {
                st.innerHTML = "✅ 保存完了";
                btn.disabled = false;
              })
              .withFailureHandler(err => {
                st.innerHTML = "❌ 失敗: " + err.message;
                btn.disabled = false;
              })
              .${runFuncName}(payload);
          };
          reader.readAsDataURL(file);
        }
      </script>
    </body>
    </html>`;
  }
}

/**
 * ダイアログを表示する（メニューなどから呼び出す用）
 */
function openCustomUploader() {
  // HTML内の google.script.run.XXXX の XXXX と一致させる
  const uploader = new UniversalFileUploader();
  uploader.show("dataAddFile");
}

/**
 * 実際にHTMLから呼び出されるグローバル関数
 * クラスのメソッドを直接呼べないため、ここをゲートウェイにする
 */
function dataAddFile(payload: FilePayload) {
  const uploader = new UniversalFileUploader();
  return uploader.upload(payload);
}
