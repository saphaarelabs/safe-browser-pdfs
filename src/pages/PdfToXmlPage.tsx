import { useState, useCallback } from "react";
import { Code, Download, Copy } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PdfToXmlPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [xml, setXml] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setXml("");
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  }, []);

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
      toast.success("Converted to XML!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
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
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolPageLayout title="PDF to XML" description="Extract PDF text into structured XML format." accentColor="hsl(30, 70%, 50%)" icon={<Code className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : !xml ? (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            {processing ? "Converting…" : "Convert to XML"}
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold mb-2">Output Preview</p>
              <pre className="max-h-72 overflow-auto rounded border bg-secondary/30 p-3 text-xs whitespace-pre-wrap">{xml.slice(0, 3000)}{xml.length > 3000 ? "\n…" : ""}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 min-h-[44px]" size="lg"><Download className="mr-2 h-4 w-4" /> Download .xml</Button>
            <Button variant="outline" className="min-h-[44px]" size="lg" onClick={() => { navigator.clipboard.writeText(xml); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={() => { setFile(null); setXml(""); }} className="w-full min-h-[44px]">Start Over</Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToXmlPage;
