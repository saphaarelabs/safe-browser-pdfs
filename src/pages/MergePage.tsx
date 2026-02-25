import { useState, useCallback } from "react";
import { Merge, X, GripVertical, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfPageThumbnail from "@/components/PdfPageThumbnail";
import { toast } from "sonner";

interface PdfFile {
  file: File;
  id: string;
  pageCount: number | null;
  bytes: ArrayBuffer;
}

const MergePage = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    const pdfFiles: PdfFile[] = [];
    for (const file of newFiles) {
      let pageCount: number | null = null;
      const buffer = await file.arrayBuffer();
      try {
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        pageCount = pdf.getPageCount();
      } catch {
        pageCount = null;
      }
      pdfFiles.push({ file, id: crypto.randomUUID(), pageCount, bytes: buffer });
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const arr = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return arr;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Add at least 2 PDF files to merge.");
      return;
    }
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const { bytes } of files) {
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      saveAs(new Blob([mergedBytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
      toast.success("PDFs merged successfully!");
    } catch (err) {
      toast.error("Failed to merge PDFs. Make sure all files are valid.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = files.reduce((s, f) => s + (f.pageCount ?? 0), 0);

  return (
    <ToolPageLayout
      title="Merge PDFs"
      description="Combine multiple PDFs into one document"
      accentColor="hsl(220, 85%, 58%)"
      icon={<Merge className="h-5 w-5" />}
    >
      <FileDropZone
        onFiles={handleFiles}
        multiple
        label="Drop PDF files here"
        sublabel="or click to browse — add multiple files"
      />

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{files.length} files · {totalPages} total pages</span>
          </div>
          <Card>
            <CardContent className="divide-y p-0">
              {files.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="shrink-0">
                    <PdfPageThumbnail fileBytes={f.bytes} pageIndex={0} width={48} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.pageCount != null ? `${f.pageCount} pages` : "Loading…"} ·{" "}
                      {(f.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px]" onClick={() => moveFile(i, -1)} disabled={i === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px]" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] text-destructive" onClick={() => removeFile(f.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {files.length > 0 && (
        <Button
          onClick={handleMerge}
          disabled={processing || files.length < 2}
          className="w-full min-h-[44px]"
          size="lg"
        >
          {processing ? "Merging…" : `Merge ${files.length} Files`}
        </Button>
      )}
    </ToolPageLayout>
  );
};

export default MergePage;
