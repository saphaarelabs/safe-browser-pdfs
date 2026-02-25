import { useState, useCallback } from "react";
import { Trash2, Download, CheckSquare, Square } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfPageThumbnail from "@/components/PdfPageThumbnail";
import { toast } from "sonner";

const DeletePagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setSelectedPages(new Set());
    const buffer = await f.arrayBuffer();
    setFileBytes(buffer);
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const togglePage = (idx: number) => {
    const next = new Set(selectedPages);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setSelectedPages(next);
  };

  const selectAll = () => setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i)));
  const selectNone = () => setSelectedPages(new Set());

  const handleDelete = async () => {
    if (!file || !fileBytes || selectedPages.size === 0) return;
    if (selectedPages.size >= pageCount) { toast.error("Can't delete all pages."); return; }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter((i) => !selectedPages.has(i));
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, keepIndices);
      pages.forEach((p) => newPdf.addPage(p));
      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `trimmed-${file.name}`);
      toast.success(`Deleted ${selectedPages.size} page(s)!`);
    } catch {
      toast.error("Failed to delete pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Delete Pages" description="Remove specific pages from your PDF" accentColor="hsl(0, 65%, 50%)" icon={<Trash2 className="h-5 w-5" />}>
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages</p>
            </div>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); }}>Change file</Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} className="gap-1.5 min-h-[44px]">
              <CheckSquare className="h-3.5 w-3.5" /> Select All
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone} className="gap-1.5 min-h-[44px]">
              <Square className="h-3.5 w-3.5" /> Deselect All
            </Button>
          </div>

          <Label className="font-semibold text-sm">Click pages to mark for deletion</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: pageCount }, (_, i) => (
              <PdfPageThumbnail
                key={i}
                fileBytes={fileBytes}
                pageIndex={i}
                width={140}
                selected={selectedPages.has(i)}
                selectionColor="destructive"
                onClick={() => togglePage(i)}
                label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <Button onClick={handleDelete} disabled={processing || selectedPages.size === 0} className="w-full min-h-[44px]" size="lg" variant="destructive">
            {processing ? "Deleting…" : `Delete ${selectedPages.size} page(s)`}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default DeletePagesPage;
