import { useState, useRef } from "react";
import { GitCompare } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ComparePdfsPage = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [diffCount, setDiffCount] = useState<number | null>(null);

  const renderPage = async (file: File): Promise<ImageData> => {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return ctx.getImageData(0, 0, vp.width, vp.height);
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    try {
      const [img1, img2] = await Promise.all([renderPage(file1), renderPage(file2)]);
      const w = Math.max(img1.width, img2.width);
      const h = Math.max(img1.height, img2.height);
      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      const out = ctx.createImageData(w, h);
      let diffs = 0;
      for (let i = 0; i < w * h * 4; i += 4) {
        const r1 = i < img1.data.length ? img1.data[i] : 255;
        const g1 = i < img1.data.length ? img1.data[i + 1] : 255;
        const b1 = i < img1.data.length ? img1.data[i + 2] : 255;
        const r2 = i < img2.data.length ? img2.data[i] : 255;
        const g2 = i < img2.data.length ? img2.data[i + 1] : 255;
        const b2 = i < img2.data.length ? img2.data[i + 2] : 255;
        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        if (diff > 30) {
          out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 200;
          diffs++;
        } else {
          out.data[i] = r1; out.data[i + 1] = g1; out.data[i + 2] = b1; out.data[i + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      setDiffCount(diffs);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Compare PDFs" description="Compare two PDFs side-by-side and highlight differences." accentColor="hsl(200, 70%, 50%)" icon={<GitCompare className="h-5 w-5" />}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">First PDF</label>
            {file1 ? <p className="text-sm border rounded p-2">{file1.name} <button className="text-xs text-muted-foreground ml-2" onClick={() => setFile1(null)}>×</button></p>
              : <FileDropZone onFiles={(f) => setFile1(f[0])} accept=".pdf" label="Drop PDF 1" className="py-8" />}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Second PDF</label>
            {file2 ? <p className="text-sm border rounded p-2">{file2.name} <button className="text-xs text-muted-foreground ml-2" onClick={() => setFile2(null)}>×</button></p>
              : <FileDropZone onFiles={(f) => setFile2(f[0])} accept=".pdf" label="Drop PDF 2" className="py-8" />}
          </div>
        </div>
        <Button onClick={handleCompare} disabled={!file1 || !file2 || processing}>{processing ? "Comparing…" : "Compare Page 1"}</Button>
        {diffCount !== null && <p className="text-sm text-muted-foreground">{diffCount === 0 ? "Pages are identical!" : `${diffCount.toLocaleString()} pixels differ (highlighted in red)`}</p>}
        <canvas ref={canvasRef} className="max-w-full rounded border" style={{ width: "100%" }} />
      </div>
    </ToolPageLayout>
  );
};

export default ComparePdfsPage;
