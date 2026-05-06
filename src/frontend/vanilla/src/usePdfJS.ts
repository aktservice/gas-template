import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/+esm";
//import * as pdfjsLib from "pdfjs-dist";
//declare const pdfjsLib: any;
//workerを定義
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.mjs";
console.log("PDF.js Worker SRC set to:", pdfjsLib.GlobalWorkerOptions.workerSrc);
