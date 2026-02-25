import { useState, useCallback } from "react";
import { Copy, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DuplicatePagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState("1");
  const [times, setTimes] = useState("2");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      setPageCount(pdf.getPageCount());
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const handleDuplicate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const doc = await PDFDocument.create();
      const totalPages = src.getPageCount();
      const pageIndices = pages.split(",").flatMap((p) => {
        const trimmed = p.trim();
        if (trimmed.includes("-")) {
          const [start, end] = trimmed.split("-").map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
        }
        return [parseInt(trimmed) - 1];
      }).filter((i) => i >= 0 && i < totalPages);
      const repeatCount = Math.max(1, Math.min(parseInt(times) || 1, 50));

      for (let i = 0; i < totalPages; i++) {
        const [page] = await doc.copyPages(src, [i]);
        doc.addPage(page);
        if (pageIndices.includes(i)) {
          for (let r = 1; r < repeatCount; r++) {
            const [dup] = await doc.copyPages(src, [i]);
            doc.addPage(dup);
          }
        }
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-duplicated.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Pages duplicated! New PDF has ${doc.getPageCount()} pages.`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to duplicate pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Duplicate Pages" description="Duplicate specific pages within your PDF." accentColor="hsl(280, 60%, 55%)" icon={<Copy className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="font-semibold">Pages to duplicate</Label>
                <Input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1,3,5-7" className="mt-1 min-h-[44px]" />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated page numbers or ranges.</p>
              </div>
              <div>
                <Label className="font-semibold">Number of copies</Label>
                <Input type="number" min={2} max={50} value={times} onChange={(e) => setTimes(e.target.value)} className="mt-1 w-24 min-h-[44px]" />
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleDuplicate} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Duplicating…" : "Duplicate & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default DuplicatePagesPage;
