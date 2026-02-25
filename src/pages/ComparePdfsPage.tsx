import { useState, useRef } from "react";
import { GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ComparePdfsPage = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [pageCount1, setPageCount1] = useState(0);
  const [pageCount2, setPageCount2] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [diffCount, setDiffCount] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);

  const loadFile = async (file: File, setter: (f: File) => void, countSetter: (n: number) => void) => {
    setter(file);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      countSetter(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  };

  const renderPage = async (file: File, pageNum: number): Promise<ImageData> => {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    if (pageNum > pdf.numPages) throw new Error("Page out of range");
    const page = await pdf.getPage(pageNum);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return ctx.getImageData(0, 0, vp.width, vp.height);
  };

  const handleCompare = async (pageNum?: number) => {
    if (!file1 || !file2) return;
    const page = pageNum || currentPage;
    setProcessing(true);
    try {
      const [img1, img2] = await Promise.all([renderPage(file1, page), renderPage(file2, page)]);
      const w = Math.max(img1.width, img2.width);
      const h = Math.max(img1.height, img2.height);
      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      const out = ctx.createImageData(w, h);
      let diffs = 0;
      const totalPixels = w * h;
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
      setSimilarity(Math.round(((totalPixels - diffs) / totalPixels) * 100));
    } catch (e) {
      console.error(e);
      toast.error("Failed to compare this page.");
    } finally {
      setProcessing(false);
    }
  };

  const maxPages = Math.min(pageCount1, pageCount2);

  const goToPage = (p: number) => {
    if (p < 1 || p > maxPages) return;
    setCurrentPage(p);
    handleCompare(p);
  };

  return (
    <ToolPageLayout title="Compare PDFs" description="Compare two PDFs page-by-page and highlight differences." accentColor="hsl(200, 70%, 50%)" icon={<GitCompare className="h-5 w-5" />} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium mb-1.5 block">First PDF</label>
          {file1 ? (
            <Card><CardContent className="p-4">
              <p className="text-sm font-medium">{file1.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount1} pages</p>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => { setFile1(null); setDiffCount(null); }}>Change</Button>
            </CardContent></Card>
          ) : <FileDropZone onFiles={(f) => loadFile(f[0], setFile1, setPageCount1)} accept=".pdf" label="Drop PDF 1" className="py-8" />}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Second PDF</label>
          {file2 ? (
            <Card><CardContent className="p-4">
              <p className="text-sm font-medium">{file2.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount2} pages</p>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => { setFile2(null); setDiffCount(null); }}>Change</Button>
            </CardContent></Card>
          ) : <FileDropZone onFiles={(f) => loadFile(f[0], setFile2, setPageCount2)} accept=".pdf" label="Drop PDF 2" className="py-8" />}
        </div>
      </div>

      <Button onClick={() => handleCompare()} disabled={!file1 || !file2 || processing} className="w-full min-h-[44px]" size="lg">
        {processing ? "Comparing…" : `Compare Page ${currentPage}`}
      </Button>

      {diffCount !== null && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {diffCount === 0 ? "✅ Pages are identical!" : `${diffCount.toLocaleString()} pixels differ`}
                </p>
                {similarity !== null && <p className="text-xs text-muted-foreground">{similarity}% similarity</p>}
              </div>
              {maxPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm px-2">Page {currentPage} / {maxPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= maxPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="max-w-full rounded border" style={{ width: "100%" }} />
          </CardContent>
        </Card>
      )}
    </ToolPageLayout>
  );
};

export default ComparePdfsPage;
