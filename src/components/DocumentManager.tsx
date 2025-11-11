import { FileText, Upload, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DocumentManagerProps = {
  documents: File[];
  onUpdate: (documents: File[]) => void;
  onDocumentsAdded?: (files: File[]) => void;
};

export const DocumentManager = ({ documents, onUpdate, onDocumentsAdded }: DocumentManagerProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === "application/pdf");
    onUpdate([...documents, ...pdfFiles]);
    if (pdfFiles.length > 0 && onDocumentsAdded) {
      onDocumentsAdded(pdfFiles);
    }
    event.target.value = "";
  };

  const removeDocument = (index: number) => {
    onUpdate(documents.filter((_, i) => i !== index));
  };

  const viewDocument = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Dokumente</span>
          <Badge variant="outline">{documents.length} Dateien</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              PDF-Dokumente hier ablegen oder auswählen
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Dateien auswählen
              </label>
            </Button>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Hochgeladene Dokumente</h4>
              {documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewDocument(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {documents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Noch keine Dokumente hochgeladen</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};