import { useState, useCallback } from "react";
import { Sheet, Download } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const ExcelToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const XLSX = await import("xlsx");
      const bytes = await f.arrayBuffer();
      const wb = XLSX.read(bytes, { type: "array" });
      setSheetNames(wb.SheetNames);
    } catch { toast.error("Could not read file."); }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const XLSX = await import("xlsx");
      const bytes = await file.arrayBuffer();
      const wb = XLSX.read(bytes, { type: "array" });
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length === 0) continue;
        const fontSize = 8;
        const cellPadding = 4;
        const rowHeight = fontSize + cellPadding * 2;
        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 40;
        const usableWidth = pageWidth - margin * 2;
        const maxCols = Math.max(...data.map((r) => r.length));
        const colWidth = usableWidth / Math.max(maxCols, 1);
        let page = doc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;
        page.drawText(sheetName, { x: margin, y: y - 12, font: boldFont, size: 12, color: rgb(0, 0, 0) });
        y -= 30;
        for (let r = 0; r < data.length; r++) {
          if (y - rowHeight < margin) {
            page = doc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          for (let c = 0; c < (data[r]?.length || 0); c++) {
            const text = String(data[r][c] ?? "").slice(0, 30);
            const x = margin + c * colWidth;
            page.drawText(text, { x: x + cellPadding, y: y - fontSize - cellPadding, font: r === 0 ? boldFont : font, size: fontSize, color: rgb(0, 0, 0) });
          }
          page.drawLine({ start: { x: margin, y: y - rowHeight }, end: { x: margin + maxCols * colWidth, y: y - rowHeight }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
          y -= rowHeight;
        }
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.(xlsx?|csv)$/i, ".pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Converted to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Excel to PDF" description="Convert Excel spreadsheets to PDF documents." accentColor="hsl(140, 60%, 40%)" icon={<Sheet className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".xlsx,.xls,.csv" label="Drop an Excel file here" sublabel=".xlsx, .xls, or .csv" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · {sheetNames.length} sheet(s): {sheetNames.join(", ")}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Converting…" : "Convert to PDF"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ExcelToPdfPage;
