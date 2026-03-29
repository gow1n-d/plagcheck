import { useState, useRef, useCallback } from "react";
import { FileText, ArrowRight, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromFile } from "@/lib/fileExtractor";
import { toast } from "sonner";

interface InputViewProps {
  onSubmit: (text: string) => void;
}

const InputView = ({ onSubmit }: InputViewProps) => {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "docx", "doc", "txt"].includes(ext)) {
      toast.error("Unsupported format. Please upload PDF, DOCX, or TXT files.");
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);

    try {
      const extracted = await extractTextFromFile(file);
      if (!extracted.trim()) {
        toast.error("No text could be extracted from this file.");
        setFileName(null);
      } else {
        setText(extracted);
        toast.success(`Extracted ${extracted.split(/\s+/).filter(Boolean).length} words from ${file.name}`);
      }
    } catch (err) {
      console.error("File extraction error:", err);
      toast.error("Failed to extract text from file.");
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    setFileName(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Aura</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Forensic Manuscript Analysis
            </p>
          </div>
        </div>

        {/* File Upload Zone */}
        <div
          className={`mt-8 surface-card p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? "ring-2 ring-primary/40 bg-primary/5" : ""
          }`}
          style={{ borderRadius: 12 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isExtracting && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {isExtracting ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 size={24} className="text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                Extracting text from <span className="font-mono text-foreground">{fileName}</span>…
              </p>
            </div>
          ) : fileName ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <FileText size={18} className="text-primary" />
              <span className="text-sm font-mono text-foreground">{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <Upload size={24} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground font-medium">
                  Drop a file here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  PDF · DOCX · TXT
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or paste text</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Textarea */}
        <div className="surface-card p-1" style={{ borderRadius: 12 }}>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (fileName) setFileName(null);
            }}
            placeholder="Paste your research paper text here for forensic analysis…"
            className="w-full h-48 p-5 bg-transparent font-manuscript text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none rounded-xl"
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText size={14} />
              <span className="font-mono">{text.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <Button
              onClick={() => text.trim() && onSubmit(text.trim())}
              disabled={!text.trim()}
              className="gap-2 rounded-lg"
              size="sm"
            >
              Analyze
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed max-w-md mx-auto">
          Aura analyzes linguistic patterns, structure, and academic writing norms.
          Powered by Scrapy live web search and Nvidia NLP semantic sequence analysis.
        </p>
      </div>
    </div>
  );
};

export default InputView;
