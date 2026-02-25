import { useState } from "react";
import { Bookmark, Download, Plus, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BookmarkEntry { title: string; page: number; }

const AddBookmarksPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([{ title: "", page: 1 }]);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read this PDF.");
    }
  };

  const handleSave = async () => {
    if (!file) return;
    const validBookmarks = bookmarks.filter((b) => b.title.trim() && b.page >= 1 && b.page <= pageCount);
    if (validBookmarks.length === 0) {
      toast.error("Add at least one bookmark with a title.");
      return;
    }
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      // Store bookmarks as structured data in metadata
      pdf.setKeywords(validBookmarks.map((b) => `${b.title}:p${b.page}`));
      pdf.setSubject(`Bookmarks: ${validBookmarks.map((b) => `${b.title} (p${b.page})`).join(", ")}`);

      const out = await pdf.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-bookmarked.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${validBookmarks.length} bookmark(s) saved to metadata!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save bookmarks.");
    } finally {
      setProcessing(false);
    }
  };

  const updateBookmark = (i: number, field: "title" | "page", value: string | number) => {
    const copy = [...bookmarks];
    if (field === "title") copy[i].title = value as string;
    else copy[i].page = Math.max(1, Math.min(value as number, pageCount));
    setBookmarks(copy);
  };

  return (
    <ToolPageLayout title="Add Bookmarks" description="Add named bookmarks to your PDF for easy navigation." accentColor="hsl(45, 80%, 45%)" icon={<Bookmark className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFile} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setBookmarks([{ title: "", page: 1 }]); }}>Choose different file</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <Label className="font-semibold">Bookmarks</Label>
              <p className="text-xs text-muted-foreground">Bookmark data is stored in PDF metadata (keywords/subject). For true outline bookmarks, a server-side library is needed.</p>
              {bookmarks.map((b, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground">Title</label>
                    <Input value={b.title} onChange={(e) => updateBookmark(i, "title", e.target.value)} placeholder="Chapter 1" className="min-h-[44px]" />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-medium text-muted-foreground">Page</label>
                    <Input type="number" min={1} max={pageCount} value={b.page} onChange={(e) => updateBookmark(i, "page", +e.target.value)} className="min-h-[44px]" />
                  </div>
                  {bookmarks.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-[44px] w-[44px] shrink-0" onClick={() => setBookmarks(bookmarks.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => setBookmarks([...bookmarks, { title: "", page: 1 }])}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Bookmark
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Saving…" : "Save Bookmarks & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default AddBookmarksPage;
