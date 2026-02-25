import { useState } from "react";
import { Image } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToTiffPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
        const buf = await blob.arrayBuffer();
        zip.file(`page-${String(i).padStart(3, "0")}.png`, buf);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = file.name.replace(".pdf", "-images.zip");
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to TIFF" description="Convert PDF pages to high-quality images bundled in a ZIP." accentColor="hsl(310, 55%, 50%)" icon={<Image className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <p className="text-xs text-muted-foreground">Pages will be rendered at 2× scale as high-quality PNGs and bundled in a ZIP file.</p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert & Download ZIP"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToTiffPage;
