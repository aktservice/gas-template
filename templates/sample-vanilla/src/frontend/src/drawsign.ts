import "./drawsign.css";
/**
 * @description 署名用のインターフェースを定義します
 * @interface IPainter
 */
interface IPainter {
  clearCanvas(): void;
  download(): void;
  preview(): void;
  copyURL(): void;
}

/**
 * @description Painterクラスのコンストラクタに渡すオプションの型を定義します
 * @interface PencilSelector
 */
interface PencilSelector {
  colorPencil?: string;
  colorPalette?: string;
  pencilSize?: string;
  pencilOpacity?: string;
  clearButton?: string;
  downloadButton?: string;
  previewButton?: string;
  previewArea?: string;
  copyURLButton?: string;
}
/**
 * @description DrawSignクラスのオプションインターフェース
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 10/06/2025
 * @interface DrawSignElements
 */
interface DrawSignElements {
  signBtnElementId: string;
  dialogElementId: string;
  canvasAreaElementId: string;
  closeBtnElementId: string;
  previewBtnElementId: string;
}

// =================================================================================
// 署名機能のメインクラス
// =================================================================================
/**
 * @description 署名機能を提供するクラス（ダイアログ表示とPainterの初期化）
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 08/06/2025
 * @export
 * @class DrawSign
 */
export class DrawSign {
  public static readonly DEFAULT_IDS: DrawSignElements = {
    signBtnElementId: "signbtn",
    dialogElementId: "canvasdialog",
    canvasAreaElementId: "canvasArea",
    closeBtnElementId: "dialogclose",
    previewBtnElementId: "previewButton",
  };

  private painter: Painter | null = null;
  private dialogElement: HTMLDialogElement | null;

  constructor(options: DrawSignElements) {
    console.log("start Draw");
    const elementIds = { ...DrawSign.DEFAULT_IDS, ...options };
    this.dialogElement = document.getElementById(
      elementIds.dialogElementId,
    ) as HTMLDialogElement | null;

    // --- イベントリスナーの設定 ---
    this.setupShowButton(elementIds.signBtnElementId, elementIds.canvasAreaElementId);
    this.setupCloseButton(elementIds.closeBtnElementId);
    // previewボタンも閉じるボタンとして機能させる
    this.setupCloseButton(elementIds.previewBtnElementId);
  }

  /**
   * @description ダイアログ表示ボタンのイベントリスナーを設定します
   * @private
   * @param {string} signBtnId - 表示ボタンのID
   * @param {string} canvasAreaId - 描画エリア（canvas）のID
   */
  private setupShowButton(signBtnId: string, canvasAreaId: string): void {
    const showBtn = document.getElementById(signBtnId);
    showBtn?.addEventListener("click", () => {
      if (this.dialogElement) {
        // ウィンドウサイズの半分をキャンバスサイズに設定
        const areaWidth = window.innerWidth / 2;
        const areaHeight = window.innerHeight / 2;

        // Painterを初期化
        this.painter = new Painter(canvasAreaId, areaWidth, areaHeight);

        // ダイアログを表示
        this.dialogElement.showModal(); // show()の代わりにshowModal()を推奨
      }
    });
  }

  /**
   * @description ダイアログを閉じるボタンのイベントリスナーを設定します
   * @private
   * @param {string} btnId - 閉じるボタンのID
   */
  private setupCloseButton(btnId: string): void {
    const closeBtn = document.getElementById(btnId);
    closeBtn?.addEventListener("click", () => {
      this.dialogElement?.close();
    });
  }
}

// =================================================================================
// 描画処理クラス
// =================================================================================
/**
 * @see https://qiita.com/nakagami5963/items/41e8eaeae241650bc03e
 * @description キャンバスへの描画機能を提供するクラス
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 2024-07-13
 * @class Painter
 */
class Painter implements IPainter {
  private element: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  // 描画設定
  private penSize: number = 3;
  private penColor: string = "#000000";
  private penOpacity: number = 1;

  // 座標
  private x: number | null = null;
  private y: number | null = null;

  // DOM要素
  private clearButton: HTMLButtonElement | null;
  private downloadButton: HTMLButtonElement | null;
  private previewButton: HTMLButtonElement | null;
  private previewArea: HTMLImageElement | null;
  private copyURLButton: HTMLButtonElement | null;

  constructor(
    private selectorId: string,
    private width: number,
    private height: number,
    private pencilSelector: PencilSelector = {
      colorPencil: "#pencilColor",
      colorPalette: ".color-palette",
      pencilSize: "#pencilSize",
      pencilOpacity: "#pencilOpacity",
      clearButton: "#clearButton",
      downloadButton: "#downloadButton",
      previewButton: "#previewButton",
      previewArea: "#preview",
      copyURLButton: "#copyURLButton",
    },
  ) {
    this.init();
  }

  /**
   * @description Painterの初期化処理
   * @private
   */
  private init(): void {
    const canvasElement = document.getElementById(this.selectorId);
    if (!canvasElement) {
      throw this.error(`Selector #${this.selectorId} is not found.`);
    }
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw this.error(`#${this.selectorId} is not a <canvas> element.`);
    }
    this.element = canvasElement;

    const context = this.element.getContext("2d");
    if (!context) {
      throw this.error("Failed to get 2D context from canvas.");
    }
    this.context = context;

    // --- DOM要素の取得 ---
    this.clearButton = document.querySelector(this.pencilSelector.clearButton ?? "");
    this.downloadButton = document.querySelector(this.pencilSelector.downloadButton ?? "");
    this.previewButton = document.querySelector(this.pencilSelector.previewButton ?? "");
    this.previewArea = document.querySelector(this.pencilSelector.previewArea ?? "");
    this.copyURLButton = document.querySelector(this.pencilSelector.copyURLButton ?? "");

    // --- キャンバスのサイズとスタイルの設定 ---
    this.element.width = this.width;
    this.element.height = this.height;
    this.setCanvasStyle();

    // --- イベントリスナーの設定 ---
    this.element.addEventListener("pointermove", this.onMouseMove);
    this.element.addEventListener("pointerdown", this.onMouseDown);
    this.element.addEventListener("pointerup", this.drawFinish);
    this.element.addEventListener("pointerout", this.drawFinish);

    this.clearButton?.addEventListener("click", this.clearCanvas);
    this.downloadButton?.addEventListener("click", this.download);
    this.previewButton?.addEventListener("click", this.preview);
    this.copyURLButton?.addEventListener("click", this.copyURL);

    // --- プレビューエリアの初期化 ---
    if (this.previewArea) {
      this.previewArea.src = "./image/no-preview.jpg";
      this.previewArea.width = this.width;
      this.previewArea.height = this.height;
    }

    // --- 描画ツール（ペン）の初期化 ---
    this.initColorPencilElements();
  }

  /**
   * @description 描画ツールのUI要素を初期化します
   * @private
   */
  private initColorPencilElements = (): void => {
    const { colorPencil, colorPalette, pencilSize, pencilOpacity } = this.pencilSelector;

    // 色選択
    const colorInputElement = document.querySelector(colorPencil ?? "") as HTMLInputElement | null;
    if (colorInputElement) {
      colorInputElement.value = this.penColor;
      colorInputElement.addEventListener("change", (e) => {
        this.penColor = (e.target as HTMLInputElement).value;
        const paletteElement = document.querySelector(colorPalette ?? "") as HTMLElement | null;
        if (paletteElement) paletteElement.style.backgroundColor = this.penColor;
      });
    }

    // サイズ選択
    const sizeInputElement = document.querySelector(pencilSize ?? "") as HTMLInputElement | null;
    if (sizeInputElement) {
      sizeInputElement.value = this.penSize.toString();
      sizeInputElement.addEventListener("change", (e) => {
        this.penSize = parseFloat((e.target as HTMLInputElement).value);
      });
    }

    // 透明度選択
    const opacityInputElement = document.querySelector(
      pencilOpacity ?? "",
    ) as HTMLInputElement | null;
    if (opacityInputElement) {
      opacityInputElement.value = this.penOpacity.toString();
      opacityInputElement.addEventListener("change", (e) => {
        this.penOpacity = parseFloat((e.target as HTMLInputElement).value);
      });
    }
  };

  /**
   * @description キャンバスの背景などを設定します
   * @private
   */
  private setCanvasStyle = (): void => {
    this.element.style.border = "1px solid #778899";
    this.context.fillStyle = "#f5f5f5";
    this.context.fillRect(0, 0, this.width, this.height);
  };

  /**
   * @description キャンバスをクリアします
   */
  public clearCanvas = (): void => {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
    this.setCanvasStyle();
  };

  /**
   * @description 描画内容をPNG画像としてダウンロードします
   */
  public download = (): void => {
    this.element.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.download = "signature.png";
      a.href = url;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  /**
   * @description プレビューを表示します
   */
  public preview = (): void => {
    if (this.previewArea) {
      this.previewArea.hidden = false;
      this.previewArea.src = this.element.toDataURL();
      this.previewArea.width = this.width;
      this.previewArea.height = this.height;
    }
  };

  /**
   * @description 画像のDataURLをクリップボードにコピーします
   */
  public copyURL = async (): Promise<void> => {
    try {
      const source = this.element.toDataURL();
      await navigator.clipboard.writeText(source);
      alert("コピーしました。画像を共有できます。");
    } catch (err) {
      alert("コピーに失敗しました。ブラウザの設定を見直してみてください。");
      console.error("Failed to copy: ", err);
    }
  };

  /**
   * @description イベントからキャンバス上の座標を計算します
   * @private
   */
  private calcCoordinate = (event: PointerEvent): { x: number; y: number } => {
    const rect = this.element.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    return { x, y };
  };

  /**
   * @description 共通のエラーメッセージを生成します
   * @private
   */
  private error = (message: string): Error => {
    return new Error(`[Painter.ts] ${message}`);
  };

  // --- イベントハンドラ ---

  private onMouseDown = (event: PointerEvent): void => {
    if (event.button !== 0) return; // 左クリック以外は無視
    this.element.setPointerCapture(event.pointerId); // ポインターをキャプチャ
    const { x, y } = this.calcCoordinate(event);
    this.x = x;
    this.y = y;
    this.draw({ x, y });
  };

  private onMouseMove = (event: PointerEvent): void => {
    if (!this.element.hasPointerCapture(event.pointerId)) return;
    const coordinate = this.calcCoordinate(event);
    this.draw(coordinate);
  };

  private drawFinish = (event: PointerEvent): void => {
    this.element.releasePointerCapture(event.pointerId); // キャプチャを解放
    this.x = null;
    this.y = null;
  };

  /**
   * @description 実際に線を描画する処理
   * @private
   */
  private draw = (coordinate: { x: number; y: number }): void => {
    const { x: toX, y: toY } = coordinate;

    this.context.beginPath();
    this.context.globalAlpha = this.penOpacity;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.lineWidth = this.penSize;
    this.context.strokeStyle = this.penColor;

    const fromX = this.x ?? toX;
    const fromY = this.y ?? toY;

    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.stroke();

    this.x = toX;
    this.y = toY;
  };
}
