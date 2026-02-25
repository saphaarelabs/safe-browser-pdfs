import { useState, useCallback } from "react";
import { Ruler, Copy } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const ptToMm = (pt: number) => (pt * 25.4 / 72).toFixed(1);
const ptToIn = (pt: number) => (pt / 72).toFixed(2);

const getPageSizeLabel = (w: number, h: number): string => {
  const sizes: [string, number, number][] = [
    ["A4", 595, 842], ["Letter", 612, 792], ["Legal", 612, 1008],
    ["A3", 842, 1191], ["A5", 420, 595], ["Tabloid", 792, 1224],
  ];
  for (const [name, sw, sh] of sizes) {
    if ((Math.abs(w - sw) < 5 && Math.abs(h - sh) < 5) || (Math.abs(w - sh) < 5 && Math.abs(h - sw) < 5)) return name;
  }
  return "Custom";
};

const PdfPageSizePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ num: number; w: number; h: number; label: string }[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const result = [];
      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        result.push({ num: i + 1, w: width, h: height, label: getPageSizeLabel(width, height) });
      }
      setPages(result);
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const exportCsv = () => {
    const csv = "Page,Width (pt),Height (pt),Width (mm),Height (mm),Size\n" +
      pages.map((p) => `${p.num},${p.w.toFixed(0)},${p.h.toFixed(0)},${ptToMm(p.w)},${ptToMm(p.h)},${p.label}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "page-sizes.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV exported!");
  };

  return (
    <ToolPageLayout title="PDF Page Size" description="Analyze page dimensions of your PDF." accentColor="hsl(190, 60%, 45%)" icon={<Ruler className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pages.length} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setPages([]); }}>Choose different file</Button>
            </CardContent>
          </Card>
          {pages.length > 0 && (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="px-3 py-2 text-left font-medium">Page</th>
                          <th className="px-3 py-2 text-left font-medium">Size</th>
                          <th className="px-3 py-2 text-left font-medium">Dimensions (pt)</th>
                          <th className="px-3 py-2 text-left font-medium">mm</th>
                          <th className="px-3 py-2 text-left font-medium">inches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((p) => (
                          <tr key={p.num} className="border-b last:border-0">
                            <td className="px-3 py-2">{p.num}</td>
                            <td className="px-3 py-2"><span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">{p.label}</span></td>
                            <td className="px-3 py-2 text-muted-foreground">{p.w.toFixed(0)} × {p.h.toFixed(0)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{ptToMm(p.w)} × {ptToMm(p.h)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{ptToIn(p.w)} × {ptToIn(p.h)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <Button variant="outline" onClick={exportCsv} className="w-full min-h-[44px]">
                <Copy className="mr-2 h-4 w-4" /> Export as CSV
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfPageSizePage;
