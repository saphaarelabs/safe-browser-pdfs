import { useState, useCallback } from "react";
import { FileCheck, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const FlattenPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFiles = useCallback((files: File[]) => { setFile(files[0]); setResult(null); }, []);

  const handleFlatten = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      
      // Remove form fields
      const form = sourcePdf.getForm();
      const fields = form.getFields();
      fields.forEach((field) => {
        try { form.removeField(field); } catch { /* some fields can't be removed */ }
      });

      // Re-serialize — this flattens annotations by stripping interactive elements
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult(blob);
      toast.success("PDF flattened!");
    } catch {
      toast.error("Failed to flatten PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Flatten PDF" description="Remove form fields and interactive elements" accentColor="hsl(200, 60%, 45%)" icon={<FileCheck className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF to flatten" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>Choose different file</Button>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={handleFlatten} disabled={processing} className="flex-1" size="lg">{processing ? "Flattening…" : "Flatten PDF"}</Button>
            {result && <Button onClick={() => saveAs(result, `flattened-${file.name}`)} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default FlattenPdfPage;
