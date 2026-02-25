import { useState, useRef, useEffect } from "react";
import { Highlighter } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type AnnotationType = "highlight" | "rectangle";
interface Annotation { type: AnnotationType; x: number; y: number; w: number; h: number; }

const AnnotatePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [tool, setTool] = useState<AnnotationType>("highlight");
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageImg, setPageImg] = useState<ImageData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const bytes = await file.arrayBuffer();
      setFileBytes(bytes);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      setPageImg(ctx.getImageData(0, 0, vp.width, vp.height));
    })();
  }, [file]);

  const redraw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !pageImg) return;
    ctx.putImageData(pageImg, 0, 0);
    annotations.forEach((a) => {
      if (a.type === "highlight") {
        ctx.fillStyle = "rgba(255, 255, 0, 0.35)";
        ctx.fillRect(a.x, a.y, a.w, a.h);
      } else {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(a.x, a.y, a.w, a.h);
      }
    });
  };

  useEffect(() => { redraw(); }, [annotations, pageImg]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    setStart({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
    setDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !start) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const ex = (e.clientX - rect.left) * scaleX;
    const ey = (e.clientY - rect.top) * scaleY;
    const ann: Annotation = { type: tool, x: Math.min(start.x, ex), y: Math.min(start.y, ey), w: Math.abs(ex - start.x), h: Math.abs(ey - start.y) };
    if (ann.w > 5 && ann.h > 5) setAnnotations([...annotations, ann]);
    setDrawing(false);
    setStart(null);
  };

  const handleSave = async () => {
    if (!fileBytes) return;
    setProcessing(true);
    try {
      redraw();
      const canvas = canvasRef.current!;
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      const imgBytes = await blob.arrayBuffer();
      const doc = await PDFDocument.create();
      const img = await doc.embedPng(imgBytes);
      const src = await PDFDocument.load(fileBytes);
      const { width, height } = src.getPage(0).getSize();
      const page = doc.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
      for (let i = 1; i < src.getPageCount(); i++) {
        const [cp] = await doc.copyPages(src, [i]);
        doc.addPage(cp);
      }
      const out = await doc.save();
      const outBlob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(outBlob);
      a.download = file!.name.replace(".pdf", "-annotated.pdf");
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF Annotate" description="Add highlights and rectangles to annotate your PDF." accentColor="hsl(50, 80%, 45%)" icon={<Highlighter className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={tool} onValueChange={(v) => setTool(v as AnnotationType)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="highlight">Highlight</SelectItem>
                <SelectItem value="rectangle">Rectangle</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{annotations.length} annotation(s)</span>
          </div>
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} className="max-w-full cursor-crosshair rounded border" style={{ width: "100%" }} />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={processing || annotations.length === 0}>{processing ? "Saving…" : "Save Annotated PDF"}</Button>
            <Button variant="outline" onClick={() => setAnnotations([])}>Clear Annotations</Button>
            <Button variant="outline" onClick={() => { setFile(null); setAnnotations([]); setPageImg(null); }}>New File</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default AnnotatePdfPage;
