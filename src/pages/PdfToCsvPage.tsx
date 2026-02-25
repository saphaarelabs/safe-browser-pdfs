import { useState, useCallback } from "react";
import { Table, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToCsvPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [csvText, setCsvText] = useState("");

  const handleFiles = useCallback((files: File[]) => { setFile(files[0]); setCsvText(""); }, []);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      let allRows: string[][] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Group text items by Y position to detect rows
        const items = content.items as Array<{ str: string; transform: number[] }>;
        const rowMap = new Map<number, string[]>();
        
        items.forEach((item) => {
          const y = Math.round(item.transform[5]);
          if (!rowMap.has(y)) rowMap.set(y, []);
          rowMap.get(y)!.push(item.str.trim());
        });

        // Sort by Y descending (top to bottom)
        const sortedRows = Array.from(rowMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([, cells]) => cells.filter(Boolean));

        allRows = [...allRows, ...sortedRows.filter((r) => r.length > 0)];
      }

      // Convert to CSV
      const csv = allRows
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      
      setCsvText(csv);
      toast.success("Table data extracted!");
    } catch {
      toast.error("Failed to extract table data.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to CSV" description="Extract tabular data from PDF into CSV format" accentColor="hsl(150, 60%, 40%)" icon={<Table className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF with table data" />
      ) : (
        <>
          <Card><CardContent className="p-6">
            <p className="font-semibold">{file.name}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setCsvText(""); }}>Choose different file</Button>
          </CardContent></Card>

          {csvText && (
            <Card><CardContent className="p-6">
              <pre className="max-h-60 overflow-auto rounded bg-secondary p-3 text-xs font-mono">{csvText.slice(0, 3000)}{csvText.length > 3000 ? "\n..." : ""}</pre>
            </CardContent></Card>
          )}

          <div className="flex gap-3">
            <Button onClick={handleExtract} disabled={processing} className="flex-1" size="lg">{processing ? "Extracting…" : "Extract to CSV"}</Button>
            {csvText && (
              <Button onClick={() => { const blob = new Blob([csvText], { type: "text/csv" }); saveAs(blob, file.name.replace(".pdf", ".csv")); }} size="lg" variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download CSV
              </Button>
            )}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToCsvPage;
