import { useState } from "react";
import { Copy } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DuplicatePagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("1");
  const [times, setTimes] = useState("2");
  const [processing, setProcessing] = useState(false);

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
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Duplicate Pages" description="Duplicate specific pages within your PDF." accentColor="hsl(280, 60%, 55%)" icon={<Copy className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Pages to duplicate</label>
            <Input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1,3,5-7" />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated page numbers or ranges.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Number of copies</label>
            <Input type="number" min={2} max={50} value={times} onChange={(e) => setTimes(e.target.value)} className="w-24" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDuplicate} disabled={processing}>{processing ? "Duplicating…" : "Duplicate & Download"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default DuplicatePagesPage;
