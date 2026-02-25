import { useCallback, useState, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

const FileDropZone = ({
  onFiles,
  accept = ".pdf",
  multiple = false,
  label = "Drop files here",
  sublabel = "or click to browse",
  className,
}: FileDropZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        accept.split(",").some((ext) => f.name.toLowerCase().endsWith(ext.trim()))
      );
      if (files.length) onFiles(files);
    },
    [accept, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onFiles(files);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors",
        dragging
          ? "border-foreground/30 bg-secondary"
          : "border-border hover:border-foreground/20 hover:bg-secondary/50",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Upload className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium">{dragging ? "Drop it!" : label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default FileDropZone;
