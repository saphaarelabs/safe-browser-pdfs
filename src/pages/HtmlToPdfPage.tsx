import { useState } from "react";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import { toast } from "sonner";

const defaultHtml = `<!DOCTYPE html>
<html>
<head><title>My Document</title></head>
<body>
  <h1>Hello World</h1>
  <p>This HTML will be converted to PDF using your browser's print function.</p>
</body>
</html>`;

const HtmlToPdfPage = () => {
  const [html, setHtml] = useState(defaultHtml);

  const handlePrint = () => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to use this tool.");
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("Print dialog opened — save as PDF!");
    } catch {
      toast.error("Failed to generate PDF from HTML.");
    }
  };

  return (
    <ToolPageLayout title="HTML to PDF" description="Convert HTML code to a PDF document" accentColor="hsl(250, 60%, 55%)" icon={<Code className="h-5 w-5" />}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Label className="font-semibold">Paste your HTML</Label>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={12}
            className="font-mono text-xs"
            placeholder="<html>...</html>"
          />
          <p className="text-xs text-muted-foreground">
            Uses your browser's built-in "Print to PDF" — choose "Save as PDF" in the print dialog.
          </p>
        </CardContent>
      </Card>
      <Button onClick={handlePrint} className="w-full" size="lg" disabled={!html.trim()}>
        Print as PDF
      </Button>
    </ToolPageLayout>
  );
};

export default HtmlToPdfPage;
