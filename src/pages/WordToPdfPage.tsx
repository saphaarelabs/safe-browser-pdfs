import { useState } from "react";
import { FileText } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const WordToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file.name}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}</style></head><body>${result.value}</body></html>`;

      // Open in a new window and trigger print (browser's print-to-PDF)
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Word to PDF" description="Convert Word documents (.docx) to PDF." accentColor="hsl(217, 70%, 50%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".docx" label="Drop a Word document here" sublabel=".docx files supported" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <p className="text-xs text-muted-foreground">This will open a print dialog — choose "Save as PDF" to download.</p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to PDF"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default WordToPdfPage;
