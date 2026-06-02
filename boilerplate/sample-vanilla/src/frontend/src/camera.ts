import "./camera.css";

export interface TakePhotoEventDetail {
  dataURL: string;
}
export interface CameraEventMap {
  takePhotoEvent: CustomEvent<TakePhotoEventDetail>;
}
/**
 * @description カメラ操作クラス
 * このクラスはEventTargetを継承しています
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 11/06/2025
 * @export
 * @class CameraManager
 * @fires CameraManager#takePhotoEvent
 * @extends {EventTarget}
 */
export class CameraManager extends EventTarget {
  // addEventListener の型定義を、私たちのイベントマップに合わせて上書きします
  public addEventListener<K extends keyof CameraEventMap>(
    type: K,
    listener: (this: CameraManager, event: CameraEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  public addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, callback, options);
  }
  // 【宣言1】カスタムイベント用
  public removeEventListener<K extends keyof CameraEventMap>(
    type: K,
    listener: (this: CameraManager, event: CameraEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;

  // 【宣言2】通常のイベント用
  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;

  // 【実装】
  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  /**
   * @description defaultIds 付属のHTMLにあわせてあります
   * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
   * @date 06/06/2025
   * @static
   * @memberof CameraManager
   */
  public static readonly DEFAULT_IDS = {
    videoElementId: "camera-view",
    canvasElementId: "capture-canvas",
    photoElementId: "photo-result",
    shootElementId: "photo-shoot",
    accordionId: "camera-accordion",
    badgeElementId: "select-img",
  };
  /** 映像を表示するためのHTMLVideoElement */
  private videoElement: HTMLVideoElement | null = null;
  /** 撮影した画像を描画するための一時的なキャンバス */
  private canvasElement: HTMLCanvasElement | null = null;
  /** 撮影した写真を表示するためのHTMLImageElement */
  private photoElement: HTMLImageElement | null = null;
  private accordionElement: HTMLElement | null = null;
  // ストリームを保持するプロパティを追加
  private shootElement: HTMLButtonElement | null = null;
  //イメージを撮影した際にnonnull
  private capturedImageData: string | null = null;
  private badgeElement: HTMLSpanElement | null = null;
  private mediaStream: MediaStream | null = null;
  /** 適用するスタイルをオブジェクトとして定義 */
  private readonly photoResultStyles: Partial<CSSStyleDeclaration> = {
    maxWidth: "100%",
    border: "2px solid #333",
    marginTop: "10px",
    height: "auto",
  };

  /**
   * CameraManagerのインスタンスを生成します。
   * 引数はすべてオプションです。
   * @param options - 各要素のIDを含むオブジェクト
   */
  constructor(options?: {
    videoElementId?: string;
    canvasElementId?: string;
    photoElementId?: string;
    shootElementId?: string;
    accordionId?: string;
    badgeElementId?: string;
  }) {
    super();
    // デフォルトIDと引数で渡されたIDをマージ（合体）させる
    // スプレッド構文(...)を使うことで、optionsの値がDEFAULT_IDSの値を上書きします。
    const finalIds = {
      ...CameraManager.DEFAULT_IDS,
      ...options,
    };

    // 以降は、マージされたfinalIdsを使って要素を取得します。
    if (finalIds.videoElementId) {
      const video = document.getElementById(finalIds.videoElementId) as HTMLVideoElement;
      if (video) this.videoElement = video;
      // エラーを投げる代わりに、見つからなかった場合はnullのままにしておくのがより柔軟かもしれません。
    }

    if (finalIds.canvasElementId) {
      const canvas = document.getElementById(finalIds.canvasElementId) as HTMLCanvasElement;
      if (canvas) this.canvasElement = canvas;
    }

    if (finalIds.photoElementId) {
      const photo = document.getElementById(finalIds.photoElementId) as HTMLImageElement;
      if (photo) this.photoElement = photo;
    }
    if (finalIds.shootElementId) {
      const shoot = document.getElementById(finalIds.shootElementId) as HTMLButtonElement;
      if (shoot) this.shootElement = shoot;
    }

    // アコーディオン要素を取得して、開閉イベントを自動で監視します。
    if (finalIds.accordionId) {
      const accordionElement = document.getElementById(finalIds.accordionId);
      this.accordionElement = accordionElement?.parentElement ?? null;
      console.log(accordionElement);
      if (accordionElement) {
        // アコーディオンが開く時にカメラを起動
        accordionElement.addEventListener("show.bs.collapse", () => {
          console.log("アコーディオンが開きます。カメラを起動します。");
          this.startCamera();
        });
        // アコーディオンが閉じる時にカメラを停止
        accordionElement.addEventListener("hide.bs.collapse", () => {
          console.log("アコーディオンが閉じます。カメラを停止します。");
          this.stopCamera();
        });
      }
    }
    if (finalIds.badgeElementId) {
      const badge = document.getElementById(finalIds.badgeElementId) as HTMLSpanElement;
      if (badge) {
        this.badgeElement = badge;
      }
    }
    this.videoElement?.addEventListener("canplay", () => {
      // 'canplay'イベントは、ビデオが再生を開始できる状態になったときに発生します。
      if (!this.shootElement) {
        return;
      } else {
        this.shootElement.disabled = false; // ボタンのdisabledを解除
      }
      console.log("カメラの準備が完了しました。撮影可能です。");
    });
    // スタイルを適用し、写真を初期化
    this.applyStyles();
    this.initPhoto();
    this.shootElement?.addEventListener("click", () => {
      console.log("shoot");
      this.takePhoto();
    });
  }

  /**
   * 定義されたスタイルオブジェクトを、管理対象のDOM要素に適用します。
   * @private
   */
  private applyStyles(): void {
    if (this.canvasElement) {
      this.canvasElement.style.display = "none";
    }
    if (this.photoElement) {
      Object.assign(this.photoElement.style, this.photoResultStyles);
    }
    this.accordionElement?.style.setProperty("--bs-accordion-border-color", "#ff0000");
  }

  /**
   * 写真表示エリアを初期化し、プレースホルダー画像を設定します。
   */
  public initPhoto(): void {
    // 必要な要素が揃っていない場合は何もしない
    if (!this.canvasElement || !this.videoElement || !this.photoElement) {
      return;
    }

    this.canvasElement.width = this.videoElement.clientWidth;
    this.canvasElement.height = this.videoElement.clientHeight;

    const context = this.canvasElement.getContext("2d");
    if (!context) {
      return;
    }

    context.fillStyle = "#AAA";
    context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.photoElement.src = this.canvasElement.toDataURL("image/png");
    this.photoElement.classList.add("d-none");
  }

  /**
   * ビデオの現在のフレームを撮影して写真として表示します。
   */
  public takePhoto(): void {
    // ガード節: 必要な要素が揃っていない場合は警告を出して処理を中断
    if (!this.photoElement || !this.canvasElement || !this.videoElement) {
      console.warn("takePhoto: 写真撮影に必要なDOM要素が設定されていません。");
      return;
    }

    // --- ここからが撮影処理の本体です ---
    console.log("shoot start");

    // photoElementを表示状態にする準備（もし'd-none'のような非表示クラスがあれば削除）
    this.photoElement.classList.remove("d-none");

    // 1. ビデオのアスペクト比を保った描画サイズを計算します。
    const drawSize = this.calcDrawSize();
    this.canvasElement.width = drawSize.width;
    this.canvasElement.height = drawSize.height;

    // 2. 2D描画コンテキストを取得します。
    const context = this.canvasElement.getContext("2d");
    if (!context) {
      console.error("takePhoto: 2Dコンテキストの取得に失敗しました。");
      return;
    }

    // 3. ビデオの現在のフレームをcanvasに描画します。
    context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

    // 4. canvasの内容を画像データ(DataURL)に変換し、photo要素のsrcに設定します。
    const picturedata = this.canvasElement.toDataURL("image/png");
    this.photoElement.src = picturedata;
    this.capturedImageData = picturedata;
    // 5. photo要素を確実に表示させます。
    this.photoElement.style.display = "block";
    this.badgeElement?.classList.remove("d-none");
    const takePhotoEvent = new CustomEvent<TakePhotoEventDetail>("takePhotoEvent", {
      detail: { dataURL: picturedata },
    });
    this.dispatchEvent(takePhotoEvent);
  }

  /**
   * 描画サイズの計算
   * 縦横比が撮影(video)が大きい時は撮影の縦基準、それ以外は撮影の横基準で計算
   * @private
   * @returns {object} 計算された幅と高さ { width: number, height: number }
   */
  private calcDrawSize(): { width: number; height: number } {
    // ガード節: videoElementがなければ、サイズの計算はできないので0を返す
    if (!this.videoElement) {
      return { width: 0, height: 0 };
    }

    const videoRatio = this.videoElement.videoHeight / this.videoElement.videoWidth;
    const viewRatio = this.videoElement.clientHeight / this.videoElement.clientWidth;

    // video要素の表示領域にフィットし、かつアスペクト比を維持するサイズを計算
    if (videoRatio > viewRatio) {
      // ビデオの方が縦長の場合（表示領域の高さに合わせる）
      return {
        height: this.videoElement.clientHeight,
        width: this.videoElement.clientHeight / videoRatio,
      };
    } else {
      // ビデオの方が横長の場合（表示領域の幅に合わせる）
      return {
        height: this.videoElement.clientWidth * videoRatio,
        width: this.videoElement.clientWidth,
      };
    }
  }

  /**
   * カメラを初期化し、映像の再生を開始します。
   */
  public startCamera(): void {
    // ガード節: videoElementがなければ、カメラを起動できない
    if (!this.videoElement) {
      console.warn("startCamera: videoElementが設定されていないため、カメラを起動できません。");
      return;
    }
    this.initVideoCamera();
  }
  /**
   * カメラのストリームを停止し、リソースを解放します。
   */
  public stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      console.log("カメラを停止しました。");
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.mediaStream = null;
  }

  /**
   * 撮影した画像データを取得します。
   * @returns {string | null} 画像データ(Base64形式)。撮影されていない場合はnull。
   */
  public getCapturedImageData(): string | null {
    const res = confirm("写真を採用しますか？");
    return this.capturedImageData;
  }

  /**
   * 撮影した写真とデータをクリアします。
   */
  public clearPhoto(): void {
    this.capturedImageData = null;
    if (this.photoElement) {
      this.photoElement.classList.remove("sendpicture");
      // initPhotoを再実行してプレースホルダーに戻す
      this.initPhoto();
    }
  }

  // ... (他のメソッド)

  /**
   * カメラの映像を取得し、<video>要素に設定します。
   * @private
   */
  private initVideoCamera(): void {
    // ガード節: startCameraでもチェックしているが、privateメソッド自身も堅牢にする
    if (!this.videoElement) {
      return;
    }

    const useFrontCamera: boolean = false;
    const mode: "user" | "environment" = useFrontCamera ? "user" : "environment";

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      .then((stream: MediaStream) => {
        // 非同期処理のコールバック内でも、念のためnullチェックを行う
        if (!this.videoElement) {
          return;
        }

        // 取得したストリームをクラスのプロパティに保存
        this.mediaStream = stream;

        this.videoElement.srcObject = stream;

        this.videoElement.play();
      })
      .catch((error: any) => {
        console.error("カメラへのアクセス中にエラーが発生しました:", error);
      });
  }
}
