import * as pdfjsLib from "pdfjs-dist";

// pdfjs-dist v4+ uses .mjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export { pdfjsLib };
