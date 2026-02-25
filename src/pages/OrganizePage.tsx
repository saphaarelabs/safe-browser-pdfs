import { useState, useCallback } from "react";
import { Layers, Download, X, GripVertical, Copy, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

interface PageItem {
  index: number;
  id: string;
}

const OrganizePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, id: crypto.randomUUID() })));
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const movePage = (i: number, dir: -1 | 1) => {
    setPages((prev) => {
      const arr = [...prev];
      const ni = i + dir;
      if (ni < 0 || ni >= arr.length) return arr;
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr;
    });
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicatePage = (i: number) => {
    setPages((prev) => {
      const arr = [...prev];
      arr.splice(i + 1, 0, { ...arr[i], id: crypto.randomUUID() });
      return arr;
    });
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, pages.map((p) => p.index));
      copiedPages.forEach((p) => newPdf.addPage(p));
      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `organized-${file.name}`);
      toast.success("PDF saved!");
    } catch (err) {
      toast.error("Failed to organize PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Organize Pages"
      description="Reorder, delete, or duplicate PDF pages"
      accentColor="hsl(210, 40%, 48%)"
      icon={<Layers className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages · {pages.length} in current order</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setFile(null); setPages([]); }}>
              Change file
            </Button>
          </div>

          <Card>
            <CardContent className="divide-y p-0">
              {pages.map((page, i) => (
                <div key={page.id} className="flex items-center gap-3 px-4 py-2.5">
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-xs font-medium">
                    {page.index + 1}
                  </div>
                  <p className="flex-1 text-sm">Page {page.index + 1}</p>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePage(i, -1)} disabled={i === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePage(i, 1)} disabled={i === pages.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicatePage(i)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePage(page.id)} disabled={pages.length <= 1}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={processing} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Saving…" : "Save & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default OrganizePage;
