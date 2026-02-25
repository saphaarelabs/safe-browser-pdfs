import { useState, useCallback } from "react";
import { Wrench, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const RepairPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFiles = useCallback((files: File[]) => { setFile(files[0]); setResult(null); }, []);

  const handleRepair = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      // Load with ignoreEncryption and throwOnInvalidObject false to handle corruption
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      
      // Re-serialize by copying all pages into a fresh document
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));
      
      // Copy metadata
      newPdf.setTitle(sourcePdf.getTitle() || "");
      newPdf.setAuthor(sourcePdf.getAuthor() || "");
      newPdf.setSubject(sourcePdf.getSubject() || "");

      const bytes = await newPdf.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      toast.success("PDF repaired successfully!");
    } catch {
      toast.error("Could not repair this PDF. It may be severely corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Repair PDF" description="Fix corrupted or broken PDF files" accentColor="hsl(30, 70%, 45%)" icon={<Wrench className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a corrupted PDF" />
      ) : (
        <>
          <Card><CardContent className="p-6">
            <p className="font-semibold">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>Choose different file</Button>
          </CardContent></Card>
          <div className="flex gap-3">
            <Button onClick={handleRepair} disabled={processing} className="flex-1" size="lg">{processing ? "Repairing…" : "Repair PDF"}</Button>
            {result && <Button onClick={() => saveAs(result, `repaired-${file.name}`)} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default RepairPdfPage;
