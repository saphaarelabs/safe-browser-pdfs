import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const WordToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file.name}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}</style></head><body>${result.value}</body></html>`;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
        toast.success("Print dialog opened — save as PDF!");
      } else {
        toast.error("Please allow popups to use this tool.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Word to PDF" description="Convert Word documents (.docx) to PDF." accentColor="hsl(217, 70%, 50%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".docx" label="Drop a Word document here" sublabel=".docx files supported" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <p className="text-xs text-muted-foreground mt-1">A print dialog will open — choose "Save as PDF" to download.</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            {processing ? "Converting…" : "Convert to PDF"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default WordToPdfPage;
