import { useState, useCallback } from "react";
import { Table, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToExcelPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState<string[][] | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreviewRows(null);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const allRows: string[][] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Group text items by Y position to form rows
        const items = content.items as { str: string; transform: number[] }[];
        const rowMap = new Map<number, { x: number; text: string }[]>();

        for (const item of items) {
          const y = Math.round(item.transform[5]);
          const x = item.transform[4];
          if (!rowMap.has(y)) rowMap.set(y, []);
          rowMap.get(y)!.push({ x, text: item.str });
        }

        // Sort rows by Y (descending = top to bottom)
        const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);
        for (const y of sortedYs) {
          const cells = rowMap.get(y)!.sort((a, b) => a.x - b.x);
          // Split into columns by detecting gaps
          const row: string[] = [];
          let currentCell = "";
          let lastX = -Infinity;
          for (const cell of cells) {
            if (cell.x - lastX > 30 && currentCell) {
              row.push(currentCell.trim());
              currentCell = "";
            }
            currentCell += cell.text;
            lastX = cell.x + cell.text.length * 5;
          }
          if (currentCell.trim()) row.push(currentCell.trim());
          if (row.some((c) => c.length > 0)) allRows.push(row);
        }

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPreviewRows(allRows.slice(0, 10));

      // Create Excel workbook
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Extracted");
      const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([xlsxData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", ".xlsx");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Extracted ${allRows.length} rows to Excel!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to extract data.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to Excel" description="Extract tabular data from PDF into an Excel spreadsheet." accentColor="hsl(140, 65%, 40%)" icon={<Table className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setPreviewRows(null); }}>Choose different file</Button>
            </CardContent>
          </Card>

          {processing && <Progress value={progress} className="h-2" />}

          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? `Extracting… ${progress}%` : "Extract to Excel (.xlsx)"}
          </Button>

          {previewRows && previewRows.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <p className="px-4 pt-4 text-sm font-semibold">Preview (first 10 rows)</p>
                <div className="overflow-auto max-h-64 p-4">
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      {previewRows.map((row, ri) => (
                        <tr key={ri} className="border-b last:border-0">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1.5 border-r last:border-0">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToExcelPage;
