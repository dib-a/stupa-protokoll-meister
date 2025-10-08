import { useState } from "react";
import { X, Maximize2, Minimize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PDFViewerProps = {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
};

export const PDFViewer = ({ file, isOpen, onClose }: PDFViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!file) return null;

  const fileUrl = URL.createObjectURL(file);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
            <h2 className="text-lg font-semibold truncate max-w-md">{file.name}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Herunterladen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="gap-2"
              >
                <Minimize2 className="h-4 w-4" />
                Verkleinern
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* PDF Container */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        </div>
      </div>
    );
  }

  // Small Dialog view
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{file.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Herunterladen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Vollbild
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-2 pb-2">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0 rounded"
            title={file.name}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
