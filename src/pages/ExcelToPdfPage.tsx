import { useState } from "react";
import { Sheet } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const ExcelToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

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

        // Sheet title
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
          // Row border
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
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Excel to PDF" description="Convert Excel spreadsheets to PDF documents." accentColor="hsl(140, 60%, 40%)" icon={<Sheet className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".xlsx,.xls,.csv" label="Drop an Excel file here" sublabel=".xlsx, .xls, or .csv" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to PDF"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ExcelToPdfPage;
