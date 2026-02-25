import { useState } from "react";
import { Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PptxGenJS from "pptxgenjs";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToPptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pptx = new PptxGenJS();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL("image/png");
        const slide = pptx.addSlide();
        slide.addImage({
          data: imgData,
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      }

      const out = await pptx.write({ outputType: "blob" }) as Blob;
      const name = file.name.replace(/\.pdf$/i, ".pptx");
      saveAs(out, name);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="PDF to PowerPoint"
      description="Convert PDF pages into a PowerPoint presentation."
      accentColor="hsl(25, 95%, 53%)"
      icon={<Presentation className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} label="Drop a PDF file" sublabel="or click to browse" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm">
              <Presentation className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
          </div>
          <Button onClick={handleConvert} disabled={processing} className="w-full">
            {processing ? "Converting…" : "Convert to PowerPoint (.pptx)"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToPptPage;
