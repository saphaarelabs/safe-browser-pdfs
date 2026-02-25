import { useState } from "react";
import { Ruler } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const ptToMm = (pt: number) => (pt * 25.4 / 72).toFixed(1);
const ptToIn = (pt: number) => (pt / 72).toFixed(2);

const PdfPageSizePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ num: number; w: number; h: number }[]>([]);

  const handleAnalyze = async () => {
    if (!file) return;
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const result = [];
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const page = pdf.getPage(i);
      const { width, height } = page.getSize();
      result.push({ num: i + 1, w: width, h: height });
    }
    setPages(result);
  };

  return (
    <ToolPageLayout title="PDF Page Size" description="Analyze page dimensions of your PDF." accentColor="hsl(190, 60%, 45%)" icon={<Ruler className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); }} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleAnalyze}>Analyze Pages</Button>
            <Button variant="outline" onClick={() => { setFile(null); setPages([]); }}>Clear</Button>
          </div>
          {pages.length > 0 && (
            <div className="overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-secondary/50"><th className="px-3 py-2 text-left">Page</th><th className="px-3 py-2 text-left">Width</th><th className="px-3 py-2 text-left">Height</th><th className="px-3 py-2 text-left">mm</th></tr></thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p.num} className="border-b last:border-0">
                      <td className="px-3 py-2">{p.num}</td>
                      <td className="px-3 py-2">{p.w.toFixed(0)} pt ({ptToIn(p.w)}")</td>
                      <td className="px-3 py-2">{p.h.toFixed(0)} pt ({ptToIn(p.h)}")</td>
                      <td className="px-3 py-2">{ptToMm(p.w)} × {ptToMm(p.h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfPageSizePage;
