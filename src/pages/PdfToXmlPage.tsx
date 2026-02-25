import { useState } from "react";
import { Code } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PdfToXmlPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [xml, setXml] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let out = `<?xml version="1.0" encoding="UTF-8"?>\n<document filename="${escapeXml(file.name)}" pages="${pdf.numPages}">\n`;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        out += `  <page number="${i}">\n`;
        let lastY: number | null = null;
        let para = "";
        for (const item of content.items as any[]) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            if (para.trim()) out += `    <paragraph>${escapeXml(para.trim())}</paragraph>\n`;
            para = "";
          }
          para += item.str;
          lastY = item.transform[5];
        }
        if (para.trim()) out += `    <paragraph>${escapeXml(para.trim())}</paragraph>\n`;
        out += `  </page>\n`;
      }
      out += `</document>`;
      setXml(out);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file!.name.replace(".pdf", ".xml");
    a.click();
  };

  return (
    <ToolPageLayout title="PDF to XML" description="Extract PDF text into structured XML format." accentColor="hsl(30, 70%, 50%)" icon={<Code className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : !xml ? (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to XML"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea value={xml} readOnly rows={16} className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button onClick={handleDownload}>Download .xml</Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(xml); }}>Copy</Button>
            <Button variant="outline" onClick={() => { setFile(null); setXml(""); }}>Start Over</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToXmlPage;
