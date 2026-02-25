import { useState, useCallback, useRef } from "react";
import { Layers, Download, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfPageThumbnail from "@/components/PdfPageThumbnail";
import { toast } from "sonner";

interface PageItem { index: number; id: string; }

const OrganizePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      setFileBytes(buffer);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, id: crypto.randomUUID() })));
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const movePage = (i: number, dir: -1 | 1) => {
    setPages((prev) => {
      const arr = [...prev];
      const ni = i + dir;
      if (ni < 0 || ni >= arr.length) return arr;
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr;
    });
  };

  const deletePage = (id: string) => setPages((prev) => prev.filter((p) => p.id !== id));

  const duplicatePage = (i: number) => {
    setPages((prev) => {
      const arr = [...prev];
      arr.splice(i + 1, 0, { ...arr[i], id: crypto.randomUUID() });
      return arr;
    });
  };

  // Drag reorder via pointer events
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    setPages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(i, 0, moved);
      return arr;
    });
    setDragIdx(i);
  };

  const handleSave = async () => {
    if (!file || !fileBytes || pages.length === 0) return;
    setProcessing(true);
    try {
      const sourcePdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, pages.map((p) => p.index));
      copiedPages.forEach((p) => newPdf.addPage(p));
      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `organized-${file.name}`);
      toast.success("PDF saved!");
    } catch (err) {
      toast.error("Failed to organize PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Organize Pages"
      description="Reorder, delete, or duplicate PDF pages with visual thumbnails"
      accentColor="hsl(210, 40%, 48%)"
      icon={<Layers className="h-5 w-5" />}
    >
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages · {pages.length} in current order</p>
            </div>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); setPages([]); }}>
              Change file
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Drag thumbnails to reorder, or use the arrow buttons. Click duplicate/delete icons below each page.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((page, i) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={() => setDragIdx(null)}
                className={`flex flex-col items-center gap-1 transition-opacity ${dragIdx === i ? "opacity-50" : ""}`}
              >
                <PdfPageThumbnail
                  fileBytes={fileBytes}
                  pageIndex={page.index}
                  width={120}
                  label={`${i + 1} (p${page.index + 1})`}
                />
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px]" onClick={() => movePage(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px]" onClick={() => movePage(i, 1)} disabled={i === pages.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px]" onClick={() => duplicatePage(i)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px] text-destructive" onClick={() => deletePage(page.id)} disabled={pages.length <= 1}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Saving…" : "Save & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default OrganizePage;
