import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const ReversePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleReverse = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const doc = await PDFDocument.create();
      const pageCount = src.getPageCount();
      for (let i = pageCount - 1; i >= 0; i--) {
        const [page] = await doc.copyPages(src, [i]);
        doc.addPage(page);
      }
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "-reversed.pdf");
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Reverse PDF" description="Reverse the page order of your PDF." accentColor="hsl(260, 60%, 55%)" icon={<ArrowDownUp className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleReverse} disabled={processing}>{processing ? "Reversing…" : "Reverse & Download"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ReversePdfPage;
