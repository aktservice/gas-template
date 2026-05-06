import "./import.css";

interface importFileOption {
  previewImgElementId?: string;
  inputFileElementId?: string;
}
export class ImportFiles {
  private importFileBtnElement: HTMLInputElement | null = null;
  private previewElement: HTMLImageElement | null = null;
  /**
   * @description 各初期値を定義
   * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
   * @date 09/06/2025
   * @static
   * @memberof ImportFiles
   */
  public static readonly DEFAULT_CONST: importFileOption = {
    previewImgElementId: "photo-result",
    inputFileElementId: "file-import",
  };

  /**
   * @type {(HTMLImageElement | null)}
   */
  /**
   * Creates an instance of ImportFiles.
   * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
   * @date 09/06/2025
   * @param {{ previewElementId?: string }} [options]
   * @memberof ImportFiles
   */
  constructor(options?: importFileOption) {
    //cosntructor
    const ids = {
      ...ImportFiles.DEFAULT_CONST,
      ...options,
    };
    if (ids.inputFileElementId) {
      const inptfile = document.getElementById(ids.inputFileElementId) as HTMLInputElement;
      if (inptfile) {
        console.log(`input-Tag ready`);
        this.importFileBtnElement = inptfile;
      }
    }
    if (ids.previewImgElementId) {
      const preview = document.getElementById(ids.previewImgElementId) as HTMLImageElement;
      if (preview) {
        console.log(`preview-tag ready`);
        this.previewElement = preview;
      }
    }
    this.setupUploadBtn();
  }

  public startImportFiles() {
    //startclass
  }
  public stopImportFiles() {
    //stop
  }
  public getPhotoImgTagFile(): string | null {
    if (this.previewElement && !this.previewElement.classList.contains("d-none")) {
      return this.previewElement.src;
    } else {
      return null;
    }
  }
  private setupUploadBtn() {
    const importbtn = this.importFileBtnElement;
    if (!importbtn) {
      console.error("importBtn not found");

      return;
    }
    importbtn.addEventListener("change", (event) => {
      const evTarget = event.target as HTMLInputElement;
      if (evTarget.files && evTarget.files.length > 0) {
        const file = evTarget.files[0];
        if (!file.type.startsWith("image/")) {
          alert("画像ファイルを選択して下さい");
          evTarget.value = "";
          return;
        }
        console.log(`${file.name}:${file.lastModified}`);
        const lastModifiedDate = new Date(file.lastModified).toLocaleString("ja-JP");

        const reader = new FileReader();
        reader.onload = (loadEv) => {
          const dataURL = loadEv.target?.result as string;
          if (!this.previewElement) {
            console.error("previewElement not found");
            return;
          }
          this.previewElement.src = dataURL;
          this.previewElement?.classList.remove("d-none");
        };
        reader.onerror = (e) => {
          console.error("ファイルの読み込みエラー");
        };
        reader.readAsDataURL(file);
        //ファイルがある場合の処理
      }
    });
  }
}
