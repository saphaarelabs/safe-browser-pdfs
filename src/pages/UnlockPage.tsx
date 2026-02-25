import { useState, useCallback } from "react";
import { Unlock, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const UnlockPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleUnlock = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `unlocked-${file.name}`);
      toast.success("PDF unlocked successfully!");
    } catch (err) {
      toast.error("Failed to unlock PDF. It may have strong encryption that requires a password.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Unlock PDF"
      description="Remove password protection from PDFs"
      accentColor="hsl(120, 65%, 45%)"
      icon={<Unlock className="h-7 w-7" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a protected PDF here" sublabel="We'll try to remove restrictions" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>
                Choose different file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool attempts to remove owner-level restrictions (like printing/copying restrictions) from PDFs.
                It works by re-creating the PDF with <code className="text-foreground">ignoreEncryption</code> enabled.
                PDFs with user-level password protection may still require the password.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handleUnlock}
            disabled={processing}
            className="w-full bg-tool-unlock text-primary-foreground hover:bg-tool-unlock/90"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Unlocking…" : "Unlock & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default UnlockPage;
