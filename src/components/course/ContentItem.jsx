import React, { useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Video, Minus, Upload, Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

const ContentItem = ({
  content,
  moduleIndex,
  contentIndex,
  updateContent,
  removeContent,
  API_URL,
  setContentFiles,
  contentFiles,
  removeContentFile,
  setIsUploading,
}) => {
  const { toast } = useToast();

  const onDropContent = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      toast({
        title: "Too many files",
        description: "Please upload only one file for this content.",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    const key = `${moduleIndex}-${contentIndex}`;
    const fileType = content.type === 'video' ? 'video' : 'document';

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    if (content.url) {
      formData.append("xfileUrl", content.url);
    }

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      setContentFiles((prev) => ({
        ...prev,
        [key]: { file, url: result.fileUrl },
      }));
      updateContent(moduleIndex, contentIndex, 'url', result.fileUrl);
    } catch (error) {
      console.error("Error uploading content file:", error);
      toast({
        title: "Error uploading file",
        description: "Failed to upload the content file. Please try again.",
        variant: "destructive",
      });
      setContentFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[key];
        return newFiles;
      });
    } finally {
      setIsUploading(false);
    }
  }, [API_URL, content, moduleIndex, contentIndex, updateContent, toast, setContentFiles, setIsUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropContent,
    accept: content.type === 'video' ? { "video/*": [] } : { "application/pdf": [], "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] },
    maxFiles: 1,
  });

  return (
    <Card className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Content Type</Label>
              <Select
                value={content.type || 'video'}
                onValueChange={(value) => updateContent(moduleIndex, contentIndex, 'type', value)}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-red-500 focus:border-red-500">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="video" className="hover:bg-gray-700">Video</SelectItem>
                  <SelectItem value="document" className="hover:bg-gray-700">Document/PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Content Title</Label>
              <Input
                value={content.title || ''}
                onChange={(e) => updateContent(moduleIndex, contentIndex, 'title', e.target.value)}
                placeholder="Content title"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => removeContent(e, moduleIndex, contentIndex)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300 font-medium">
            {content.type === 'video' ? 'Video File or URL *' : 'Document File or URL *'}
          </Label>
          <div className="flex items-center gap-4 mb-4">
            <Button
              type="button"
              variant={content.mode === "upload" ? "default" : "outline"}
              onClick={() => updateContent(moduleIndex, contentIndex, 'mode', 'upload')}
              className={content.mode === "upload" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Upload File
            </Button>
            <Button
              type="button"
              variant={content.mode === "url" ? "default" : "outline"}
              onClick={() => updateContent(moduleIndex, contentIndex, 'mode', 'url')}
              className={content.mode === "url" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Enter URL
            </Button>
          </div>

          {content.mode === "upload" ? (
            <div>
              {contentFiles[`${moduleIndex}-${contentIndex}`] ? (
                <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                  {content.type === 'video' ? (
                    <Video className="h-12 w-12 text-gray-400" />
                  ) : (
                    <FileText className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-gray-300">{contentFiles[`${moduleIndex}-${contentIndex}`].file.name}</p>
                    <p className="text-sm text-gray-400">{(contentFiles[`${moduleIndex}-${contentIndex}`].file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContentFile(moduleIndex, contentIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    isDragActive ? "border-red-500 bg-red-500/10" : "border-gray-600"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-300">
                    Drag & drop a {content.type === 'video' ? 'video' : 'document'} file here, or click to select a file
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    (Max 50MB, {content.type === 'video' ? 'video files only' : 'PDF or Word documents'})
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Input
              value={content.url || ''}
              onChange={(e) => updateContent(moduleIndex, contentIndex, 'url', e.target.value)}
              placeholder={content.type === 'video' ? 'YouTube or Vimeo URL' : 'PDF or document URL'}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300 font-medium">Content Description</Label>
          <Textarea
            value={content.description || ''}
            onChange={(e) => updateContent(moduleIndex, contentIndex, 'description', e.target.value)}
            placeholder="Describe this content"
            className="h-20 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
          />
        </div>
      </div>
    </Card>
  );
};

export default ContentItem;