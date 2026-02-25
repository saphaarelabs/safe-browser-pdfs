import { useState, useRef, useEffect, useCallback } from "react";
import { Highlighter, Undo2, ChevronLeft, ChevronRight, Type } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type AnnotationType = "highlight" | "rectangle" | "text";
interface Annotation { type: AnnotationType; x: number; y: number; w: number; h: number; text?: string; }

const TOOL_OPTIONS: { value: AnnotationType; label: string }[] = [
  { value: "highlight", label: "Highlight" },
  { value: "rectangle", label: "Rectangle" },
  { value: "text", label: "Text Note" },
];

const AnnotatePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [annotationsPerPage, setAnnotationsPerPage] = useState<Record<number, Annotation[]>>({});
  const [tool, setTool] = useState<AnnotationType>("highlight");
  const [textInput, setTextInput] = useState("");
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
      setPdfDoc(pdf);
      setPageCount(pdf.numPages);
      setCurrentPage(0);
      setAnnotationsPerPage({});
    })();
  }, [file]);

  useEffect(() => {
    if (!pdfDoc) return;
    (async () => {
      const page = await pdfDoc.getPage(currentPage + 1);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      canvas.width = vp.width; canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      setPageImg(ctx.getImageData(0, 0, vp.width, vp.height));
    })();
  }, [pdfDoc, currentPage]);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !pageImg) return;
    ctx.putImageData(pageImg, 0, 0);
    (annotationsPerPage[currentPage] || []).forEach((a) => {
      if (a.type === "highlight") {
        ctx.fillStyle = "rgba(255, 255, 0, 0.35)";
        ctx.fillRect(a.x, a.y, a.w, a.h);
      } else if (a.type === "rectangle") {
        ctx.strokeStyle = "red"; ctx.lineWidth = 2;
        ctx.strokeRect(a.x, a.y, a.w, a.h);
      } else if (a.type === "text" && a.text) {
        ctx.fillStyle = "rgba(255, 245, 157, 0.9)";
        ctx.fillRect(a.x, a.y, Math.max(100, ctx.measureText(a.text).width + 12), 24);
        ctx.fillStyle = "#333"; ctx.font = "14px sans-serif";
        ctx.fillText(a.text, a.x + 6, a.y + 17);
      }
    });
  }, [pageImg, annotationsPerPage, currentPage]);

  useEffect(() => { redraw(); }, [redraw]);

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = canvasRef.current!.width / rect.width;
    const sy = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (tool === "text") {
      if (textInput.trim()) {
        const ann: Annotation = { type: "text", x: pos.x, y: pos.y, w: 0, h: 0, text: textInput };
        setAnnotationsPerPage((prev) => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), ann] }));
      }
      return;
    }
    setStart(pos);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start || tool === "text") return;
    const end = getPos(e);
    const ann: Annotation = { type: tool, x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) };
    if (ann.w > 5 && ann.h > 5) {
      setAnnotationsPerPage((prev) => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), ann] }));
    }
    setStart(null);
  };

  const undo = () => {
    setAnnotationsPerPage((prev) => {
      const arr = [...(prev[currentPage] || [])]; arr.pop();
      return { ...prev, [currentPage]: arr };
    });
  };

  const totalAnns = Object.values(annotationsPerPage).reduce((sum, arr) => sum + arr.length, 0);

  const handleSave = async () => {
    if (!fileBytes || totalAnns === 0) return;
    setProcessing(true);
    try {
      const src = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const doc = await PDFDocument.create();

      for (let i = 0; i < pageCount; i++) {
        const anns = annotationsPerPage[i];
        if (anns && anns.length > 0) {
          const page = await pdfDoc!.getPage(i + 1);
          const vp = page.getViewport({ scale: 1.5 });
          const cvs = document.createElement("canvas");
          cvs.width = vp.width; cvs.height = vp.height;
          const ctx = cvs.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          anns.forEach((a) => {
            if (a.type === "highlight") { ctx.fillStyle = "rgba(255,255,0,0.35)"; ctx.fillRect(a.x, a.y, a.w, a.h); }
            else if (a.type === "rectangle") { ctx.strokeStyle = "red"; ctx.lineWidth = 2; ctx.strokeRect(a.x, a.y, a.w, a.h); }
            else if (a.type === "text" && a.text) {
              ctx.fillStyle = "rgba(255,245,157,0.9)";
              ctx.fillRect(a.x, a.y, Math.max(100, ctx.measureText(a.text).width + 12), 24);
              ctx.fillStyle = "#333"; ctx.font = "14px sans-serif"; ctx.fillText(a.text, a.x + 6, a.y + 17);
            }
          });
          const blob = await new Promise<Blob>((r) => cvs.toBlob((b) => r(b!), "image/png"));
          const img = await doc.embedPng(new Uint8Array(await blob.arrayBuffer()));
          const { width, height } = src.getPage(i).getSize();
          const p = doc.addPage([width, height]);
          p.drawImage(img, { x: 0, y: 0, width, height });
        } else {
          const [cp] = await doc.copyPages(src, [i]);
          doc.addPage(cp);
        }
      }

      const out = await doc.save();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
      a.download = file!.name.replace(".pdf", "-annotated.pdf");
      a.click();
      toast.success("PDF annotated!");
    } catch (e) {
      console.error(e); toast.error("Failed to annotate PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF Annotate" description="Add highlights, rectangles, and text notes on any page." accentColor="hsl(50, 80%, 45%)" icon={<Highlighter className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          {/* Tool selector */}
          <div className="flex flex-wrap gap-1.5 rounded-lg bg-secondary p-1">
            {TOOL_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors min-h-[44px] ${tool === t.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tool === "text" && (
            <Input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type your note, then click on the page to place it" className="min-h-[44px]" />
          )}

          {/* Page nav */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">Page {currentPage + 1} / {pageCount}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))} disabled={currentPage >= pageCount - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">{totalAnns} annotation(s)</span>
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="max-w-full cursor-crosshair rounded border touch-none"
            style={{ width: "100%" }}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={processing || totalAnns === 0} className="min-h-[44px]">
              {processing ? "Saving…" : "Save Annotated PDF"}
            </Button>
            <Button variant="outline" onClick={undo} disabled={!(annotationsPerPage[currentPage]?.length)} className="gap-1.5 min-h-[44px]">
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </Button>
            <Button variant="outline" onClick={() => setAnnotationsPerPage({})} className="min-h-[44px]">Clear All</Button>
            <Button variant="outline" onClick={() => { setFile(null); setAnnotationsPerPage({}); setPageImg(null); }} className="min-h-[44px]">New File</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default AnnotatePdfPage;
