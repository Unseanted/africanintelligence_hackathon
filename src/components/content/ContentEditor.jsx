import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText,
  GitBranch,
  Save,
  Eye,
  Code2,
  Image as ImageIcon,
  Link,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Loader2
} from 'lucide-react';

const ContentEditor= ({
  contentId,
  initialContent,
  onSave,
  onPreview,
  contentTypes = [
    { value: 'lesson', label: 'Lesson' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'resource', label: 'Resource' }
  ]
}) => {
  const [content, setContent] = useState({
    title: '',
    description: '',
    body: '',
    contentType: 'lesson',
    branch: 'main',
    commitMessage: '',
    isDraft: true,
    formatting: {
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      list: null,
      link: null,
      image: null,
      code: false
    },
    ...initialContent
  });

  const [editorState, setEditorState] = useState({
    isDirty: false,
    lastSaved: Date,
    history: [],
    currentHistoryIndex: -1,
    isSaving: false
  });

  // Initialize with default content if provided
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      setEditorState(prev => ({
        ...prev,
        history: [initialContent],
        currentHistoryIndex: 0
      }));
    }
  }, [initialContent]);

  const handleContentChange = (field, value) => {
    setContent(prev => {
      const newContent = { ...prev, [field]: value };
      setEditorState(prevState => ({
        ...prevState,
        isDirty: true,
        history: [...prevState.history.slice(0, prevState.currentHistoryIndex + 1), newContent],
        currentHistoryIndex: prevState.currentHistoryIndex + 1
      }));
      return newContent;
    });
  };

  const handleFormatting = (type, value) => {
    setContent(prev => {
      const newFormatting = { ...prev.formatting };
      
      switch (type) {
        case 'bold':
        case 'italic':
        case 'underline':
        case 'code':
          newFormatting[type] = !prev.formatting[type];
          break;
        case 'align':
          newFormatting.align = value;
          break;
        case 'list':
          newFormatting.list = prev.formatting.list === value ? null : value;
          break;
        case 'link':
          {
            const url = prompt('Enter URL:');
            if (url) {
              newFormatting.link = url;
            }
            break;
          }
        case 'image':
          {
            const imageUrl = prompt('Enter image URL:');
            if (imageUrl) {
              newFormatting.image = imageUrl;
            }
            break;
          }
      }

      const newContent = {
        ...prev,
        formatting: newFormatting
      };

      setEditorState(prevState => ({
        ...prevState,
        isDirty: true,
        history: [...prevState.history.slice(0, prevState.currentHistoryIndex + 1), newContent],
        currentHistoryIndex: prevState.currentHistoryIndex + 1
      }));

      return newContent;
    });
  };

  const handleSave = async () => {
    if (editorState.isSaving) return;
    
    setEditorState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const formattedContent = {
        ...content,
        formattedBody: {
          text: content.body,
          formatting: content.formatting
        }
      };

      if (onSave) {
        await onSave(formattedContent);
      }

      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
        isSaving: false
      }));
      
      toast.success('Content saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save content');
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleUndo = () => {
    if (editorState.currentHistoryIndex > 0) {
      const newIndex = editorState.currentHistoryIndex - 1;
      setContent(editorState.history[newIndex]);
      setEditorState(prev => ({
        ...prev,
        currentHistoryIndex: newIndex,
        isDirty: newIndex !== prev.history.length - 1
      }));
    }
  };

  const handleRedo = () => {
    if (editorState.currentHistoryIndex < editorState.history.length - 1) {
      const newIndex = editorState.currentHistoryIndex + 1;
      setContent(editorState.history[newIndex]);
      setEditorState(prev => ({
        ...prev,
        currentHistoryIndex: newIndex,
        isDirty: newIndex !== prev.history.length - 1
      }));
    }
  };

  const handleCreateBranch = () => {
    const branchName = `feature/${content.title.toLowerCase().replace(/\s+/g, '-')}`;
    handleContentChange('branch', branchName);
    toast.success(`Created new branch: ${branchName}`);
  };

  const handlePreview = () => {
    const previewContent = {
      ...content,
      formattedBody: {
        text: content.body,
        formatting: content.formatting
      }
    };

    if (onPreview) {
      onPreview(previewContent);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Content Editor</h2>
          <Badge variant={content.isDraft ? "secondary" : "default"}>
            {content.isDraft ? "Draft" : "Published"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleUndo} 
            disabled={editorState.currentHistoryIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRedo} 
            disabled={editorState.currentHistoryIndex >= editorState.history.length - 1}
          >
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!editorState.isDirty || editorState.isSaving}
          >
            {editorState.isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editorState.isDirty ? "Save Changes" : "Saved"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={content.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Enter content title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={content.description}
                onChange={(e) => handleContentChange('description', e.target.value)}
                placeholder="Enter content description"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label>Content</Label>
              <div className="flex items-center gap-1 flex-wrap">
                <Button 
                  variant={content.formatting.bold ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.italic ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.underline ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('underline')}
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button 
                  variant={content.formatting.align === 'left' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('align', 'left')}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.align === 'center' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('align', 'center')}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.align === 'right' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('align', 'right')}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button 
                  variant={content.formatting.list === 'bullet' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('list', 'bullet')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.list === 'ordered' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('list', 'ordered')}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.link ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('link')}
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.image ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('image')}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant={content.formatting.code ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handleFormatting('code')}
                >
                  <Code2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={content.body}
              onChange={(e) => handleContentChange('body', e.target.value)}
              placeholder="Write your content here..."
              className={`min-h-[400px] font-mono ${
                content.formatting.align === 'center' ? 'text-center' : 
                content.formatting.align === 'right' ? 'text-right' : 'text-left'
              }`}
              style={{
                fontWeight: content.formatting.bold ? 'bold' : 'normal',
                fontStyle: content.formatting.italic ? 'italic' : 'normal',
                textDecoration: content.formatting.underline ? 'underline' : 'none',
                fontFamily: content.formatting.code ? 'monospace' : 'inherit'
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Git Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Current Branch</Label>
                <div className="flex items-center gap-2 mt-1">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-mono">{content.branch}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCreateBranch}
                    disabled={!content.title}
                  >
                    <GitBranch className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Commit Message</Label>
                <Input
                  value={content.commitMessage}
                  onChange={(e) => handleContentChange('commitMessage', e.target.value)}
                  placeholder="Enter commit message"
                />
              </div>
              <div>
                <Label>Content Type</Label>
                <Select
                  value={content.contentType}
                  onValueChange={(value) => handleContentChange('contentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Editor Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Saved</span>
                <span className="text-sm">
                {editorState.lastSaved
  ? new Date(editorState.lastSaved).toLocaleTimeString()
  : 'Not yet saved'}

                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={editorState.isDirty ? "destructive" : "default"}>
                  {editorState.isDirty ? "Unsaved Changes" : "Saved"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">History</span>
                <span className="text-sm">
                  {editorState.currentHistoryIndex + 1} / {editorState.history.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default ContentEditor;