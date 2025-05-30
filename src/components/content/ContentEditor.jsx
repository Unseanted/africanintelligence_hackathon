import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
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
  History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ContentEditor = ({ contentId, onSave, onPreview }) => {
  const [content, setContent] = useState({
    title: '',
    description: '',
    body: '',
    contentType: 'lesson',
    branch: 'main',
    commitMessage: '',
    isDraft: true
  });

  const [editorState, setEditorState] = useState({
    isDirty: false,
    lastSaved: null,
    history: [],
    currentHistoryIndex: -1
  });

  const handleContentChange = (field, value) => {
    setContent(prev => {
      const newContent = { ...prev, [field]: value };
      setEditorState(prev => ({
        ...prev,
        isDirty: true,
        history: [...prev.history.slice(0, prev.currentHistoryIndex + 1), newContent],
        currentHistoryIndex: prev.currentHistoryIndex + 1
      }));
      return newContent;
    });
  };

  const handleSave = () => {
    onSave?.(content);
    setEditorState(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date()
    }));
    toast.success('Content saved successfully');
  };

  const handleUndo = () => {
    if (editorState.currentHistoryIndex > 0) {
      setEditorState(prev => ({
        ...prev,
        currentHistoryIndex: prev.currentHistoryIndex - 1
      }));
      setContent(editorState.history[editorState.currentHistoryIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (editorState.currentHistoryIndex < editorState.history.length - 1) {
      setEditorState(prev => ({
        ...prev,
        currentHistoryIndex: prev.currentHistoryIndex + 1
      }));
      setContent(editorState.history[editorState.currentHistoryIndex + 1]);
    }
  };

  const handleCreateBranch = () => {
    const branchName = `feature/${content.title.toLowerCase().replace(/\s+/g, '-')}`;
    handleContentChange('branch', branchName);
    toast.success(`Created new branch: ${branchName}`);
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
          <Button variant="outline" onClick={handleUndo} disabled={editorState.currentHistoryIndex <= 0}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" onClick={handleRedo} disabled={editorState.currentHistoryIndex >= editorState.history.length - 1}>
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button variant="outline" onClick={() => onPreview?.(content)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
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
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Underline className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm">
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Link className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Code2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={content.body}
              onChange={(e) => handleContentChange('body', e.target.value)}
              placeholder="Write your content here..."
              className="min-h-[400px] font-mono"
            />
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Git Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Current Branch</Label>
                <div className="flex items-center gap-2 mt-1">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-mono">{content.branch}</span>
                  <Button variant="ghost" size="sm" onClick={handleCreateBranch}>
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
                    <SelectItem value="lesson">Lesson</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Editor Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Saved</span>
                <span className="text-sm">
                  {editorState.lastSaved ? new Date(editorState.lastSaved).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={editorState.isDirty ? "destructive" : "default"}>
                  {editorState.isDirty ? "Unsaved Changes" : "Saved"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">History</span>
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