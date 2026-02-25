import { useState } from "react";
import { Layers } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const operations = [
  { value: "rotate90", label: "Rotate 90°" },
  { value: "rotate180", label: "Rotate 180°" },
  { value: "reverse", label: "Reverse Pages" },
  { value: "flatten", label: "Flatten (re-save)" },
];

const BatchProcessPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [operation, setOperation] = useState("rotate90");
  const [processing, setProcessing] = useState(false);

  const processFile = async (file: File): Promise<Uint8Array> => {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);

    if (operation === "rotate90" || operation === "rotate180") {
      const angle = operation === "rotate90" ? 90 : 180;
      const pages = src.getPages();
      for (const page of pages) {
        page.setRotation({ type: 0, angle: (page.getRotation().angle + angle) % 360 } as any);
      }
      return src.save();
    }

    if (operation === "reverse") {
      const doc = await PDFDocument.create();
      for (let i = src.getPageCount() - 1; i >= 0; i--) {
        const [page] = await doc.copyPages(src, [i]);
        doc.addPage(page);
      }
      return doc.save();
    }

    // flatten - just re-save
    return src.save();
  };

  const handleBatch = async () => {
    if (!files.length) return;
    setProcessing(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        const result = await processFile(file);
        zip.file(file.name, result);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "batch-processed.zip";
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Batch Process" description="Apply the same operation to multiple PDFs at once." accentColor="hsl(150, 55%, 45%)" icon={<Layers className="h-5 w-5" />}>
      {!files.length ? (
        <FileDropZone onFiles={setFiles} accept=".pdf" multiple label="Drop multiple PDFs here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm"><strong>{files.length}</strong> files selected</p>
          <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
            {files.map((f, i) => <li key={i}>{f.name}</li>)}
          </ul>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Operation</label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {operations.map((op) => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBatch} disabled={processing}>{processing ? "Processing…" : "Process All & Download ZIP"}</Button>
            <Button variant="outline" onClick={() => setFiles([])}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default BatchProcessPage;
