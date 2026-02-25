import { useState, useCallback } from "react";
import { ArrowDownUp, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const ReversePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
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

  const handleReverse = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const doc = await PDFDocument.create();
      const count = src.getPageCount();
      for (let i = count - 1; i >= 0; i--) {
        const [page] = await doc.copyPages(src, [i]);
        doc.addPage(page);
      }
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-reversed.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Page order reversed!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reverse PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Reverse PDF" description="Reverse the page order of your PDF." accentColor="hsl(260, 60%, 55%)" icon={<ArrowDownUp className="h-5 w-5" />}>
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
          <p className="text-sm text-muted-foreground">Pages will be reordered: {pageCount}, {pageCount - 1}, … 2, 1</p>
          <Button onClick={handleReverse} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Reversing…" : "Reverse & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ReversePdfPage;
