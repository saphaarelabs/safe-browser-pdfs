import { useState, useCallback } from "react";
import { Merge, X, GripVertical, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

interface PdfFile {
  file: File;
  id: string;
  pageCount: number | null;
}

const MergePage = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    const pdfFiles: PdfFile[] = [];
    for (const file of newFiles) {
      let pageCount: number | null = null;
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        pageCount = pdf.getPageCount();
      } catch {
        pageCount = null;
      }
      pdfFiles.push({ file, id: crypto.randomUUID(), pageCount });
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
      for (const { file } of files) {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
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

  return (
    <ToolPageLayout
      title="Merge PDFs"
      description="Combine multiple PDFs into one document"
      accentColor="hsl(220, 85%, 58%)"
      icon={<Merge className="h-7 w-7" />}
    >
      <FileDropZone
        onFiles={handleFiles}
        multiple
        label="Drop PDF files here"
        sublabel="or click to browse — add multiple files"
      />

      {files.length > 0 && (
        <Card>
          <CardContent className="divide-y p-0">
            {files.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tool-merge/10 text-tool-merge">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.pageCount != null ? `${f.pageCount} pages` : "Loading…"} ·{" "}
                    {(f.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveFile(i, -1)} disabled={i === 0}>↑</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}>↓</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFile(f.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <Button
          onClick={handleMerge}
          disabled={processing || files.length < 2}
          className="w-full bg-tool-merge text-white hover:bg-tool-merge/90"
          size="lg"
        >
          {processing ? "Merging…" : `Merge ${files.length} Files`}
        </Button>
      )}
    </ToolPageLayout>
  );
};

export default MergePage;
