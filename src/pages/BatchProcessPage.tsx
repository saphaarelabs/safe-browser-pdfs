import { useState } from "react";
import { Layers, Download, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [progress, setProgress] = useState(0);

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const processFile = async (file: File): Promise<Uint8Array> => {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    if (operation === "rotate90" || operation === "rotate180") {
      const angle = operation === "rotate90" ? 90 : 180;
      for (const page of src.getPages()) {
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
    return src.save();
  };

  const handleBatch = async () => {
    if (!files.length) return;
    setProcessing(true);
    setProgress(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const result = await processFile(files[i]);
        zip.file(files[i].name, result);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "batch-processed.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${files.length} files processed!`);
    } catch (e) {
      console.error(e);
      toast.error("Batch processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Batch Process" description="Apply the same operation to multiple PDFs at once." accentColor="hsl(150, 55%, 45%)" icon={<Layers className="h-5 w-5" />}>
      <FileDropZone onFiles={(f) => setFiles((prev) => [...prev, ...f])} accept=".pdf" multiple label="Drop multiple PDFs here" />

      {files.length > 0 && (
        <>
          <Card>
            <CardContent className="p-0 divide-y max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <Label className="font-semibold">Operation</Label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {operations.map((op) => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {processing && <Progress value={progress} className="h-2" />}

          <div className="flex gap-2">
            <Button onClick={handleBatch} disabled={processing} className="flex-1 min-h-[44px]" size="lg">
              <Download className="mr-2 h-4 w-4" />
              {processing ? `Processing… ${progress}%` : `Process ${files.length} Files & Download ZIP`}
            </Button>
            <Button variant="outline" onClick={() => setFiles([])} className="min-h-[44px]" size="lg">Clear All</Button>
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default BatchProcessPage;
