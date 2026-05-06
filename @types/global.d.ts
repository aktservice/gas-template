// --- 1. エラー定義 ---
interface AppError {
  name: string;
  message: string;
  stack?: string;
  code?: number;
  details?: any;
}

/**
 * サーバーからの標準レスポンス形式
 * 成功時と失敗時で型を分けることで、フロントエンドでの処理を堅牢にします
 */
type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: AppError;
    };

// --- 2. サーバー側関数の定義エリア ---
/**
 * ここにサーバー側（index.ts）で作成する関数を追加していきます。
 * これを分離することで、google.script.run への反映が楽になります。
 */
interface AppsScriptApi {
  doGet(e: google.script.DoGet): GoogleAppsScript.HTML.HtmlOutput;
  buildSelectOptions(
    bucode: string | number,
    defaultIndex: number,
    datalistId: string,
    defaultListSheetIndex: number,
    defaultReturnSheetIndex: number,
    listSheetName: string,
  ): void;
  echo(message: string): string;
  // 新しい関数を追加するときはここに追加するだけ！
}

// --- 3. Google Apps Script 標準定義の拡張 ---
declare var global: {
  [key in keyof AppsScriptApi]: AppsScriptApi[key];
} & {
  [key: string]: any;
};

declare namespace google {
  namespace script {
    /**
     * IRun を AppsScriptApi から自動生成します。
     * これにより、サーバー側の関数名が補完の候補に自動で現れます。
     */
    interface IRun extends AppsScriptApi {
      withFailureHandler(
        callback: (error: Error | AppError, object?: any) => void,
      ): IRun;
      withSuccessHandler<T>(callback: (value: T, object?: any) => void): IRun;
      withUserObject(object: object): IRun;
    }

    const run: IRun;

    // --- 以下、OS提供の標準オブジェクト（変更不要な部分） ---
    interface AppsScriptHttpRequestEvent {
      parameter: { [key: string]: string };
      contextPath: string;
      contentLength: number;
      queryString: string;
      parameters: { [key: string]: string[] };
      pathInfo: string;
    }

    interface DoGet extends AppsScriptHttpRequestEvent {}

    interface IUrlLocation {
      hash: string;
      parameter: { [key: string]: any };
      parameters: { [key: string]: any[] };
    }

    namespace history {
      function push(
        stateObject?: any,
        params?: { [key: string]: any },
        hash?: string,
      ): void;
      function replace(
        stateObject?: any,
        params?: { [key: string]: any },
        hash?: string,
      ): void;
      function setChangeHandler(
        callback: (event: { state: any; location: IUrlLocation }) => void,
      ): void;
    }

    namespace host {
      function close(): void;
      function setHeight(height: number): void;
      function setWidth(width: number): void;
      namespace editor {
        function focus(): void;
      }
    }

    namespace url {
      function getLocation(callback: (location: IUrlLocation) => void): void;
    }
  }
}
