import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Minus, HelpCircle, FileQuestion, BookOpen } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import QuizEditor from './QuizEditor';
import { useTourLMS } from '@/contexts/TourLMSContext';
import ContentItem from './ContentItem';

const CourseModuleEditor = ({ modules, onChange, setIsUploading }) => {
  const { API_URL } = useTourLMS();
  const [expandedModule, setExpandedModule] = useState(null);
  const [showQuizEditor, setShowQuizEditor] = useState(null);
  const [contentFiles, setContentFiles] = useState({});

  const addModule = (e) => {
    if (e) e.preventDefault();
    onChange([...modules, {
      title: '',
      description: '',
      content: [],
      quiz: null
    }]);
  };

  const removeModule = (e, index) => {
    if (e) e.preventDefault();
    onChange(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    onChange(updatedModules);
  };

  const addContent = (e, moduleIndex) => {
    if (e) e.preventDefault();
    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].content) {
      updatedModules[moduleIndex].content = [];
    }

    updatedModules[moduleIndex].content.push({
      type: 'video',
      title: '',
      url: '',
      description: '',
      mode: 'upload'
    });
    onChange(updatedModules);
  };

  const removeContent = (e, moduleIndex, contentIndex) => {
    if (e) e.preventDefault();
    const key = `${moduleIndex}-${contentIndex}`;
    setContentFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    const updatedModules = [...modules];
    updatedModules[moduleIndex].content = updatedModules[moduleIndex].content.filter((_, i) => i !== contentIndex);
    onChange(updatedModules);
  };

  const updateContent = (moduleIndex, contentIndex, field, value) => {
    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].content[contentIndex]) {
      updatedModules[moduleIndex].content[contentIndex] = {};
    }

    updatedModules[moduleIndex].content[contentIndex] = {
      ...updatedModules[moduleIndex].content[contentIndex],
      [field]: value
    };
    onChange(updatedModules);
  };

  const handleQuizSave = (moduleIndex, quiz) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].quiz = quiz;
    onChange(updatedModules);
    setShowQuizEditor(null);
  };

  const toggleModuleExpansion = (e, moduleIndex) => {
    if (e) e.preventDefault();
    setExpandedModule(expandedModule === moduleIndex ? null : moduleIndex);
  };

  const showQuizEditorHandler = (e, moduleIndex) => {
    if (e) e.preventDefault();
    setShowQuizEditor(moduleIndex);
  };

  const removeContentFile = (moduleIndex, contentIndex) => {
    const key = `${moduleIndex}-${contentIndex}`;
    setContentFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    updateContent(moduleIndex, contentIndex, 'url', '');
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-red-500/20">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">Course Modules</h2>
          </div>
          <Button 
            type="button" 
            onClick={addModule} 
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card 
              key={moduleIndex} 
              className={`p-4 sm:p-6 border-2 ${expandedModule === moduleIndex ? 'border-red-500/50' : 'border-gray-700'} bg-gray-900/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20`}
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium text-sm sm:text-base">Module Title</Label>
                      <Input
                        value={module.title || ''}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        placeholder="Enter module title"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium text-sm sm:text-base">Module Description</Label>
                      <Textarea
                        value={module.description || ''}
                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                        placeholder="Describe this module"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="text-red-500 border-gray-600 hover:bg-gray-700"
                      onClick={(e) => toggleModuleExpansion(e, moduleIndex)}
                    >
                      {expandedModule === moduleIndex ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => removeModule(e, moduleIndex)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedModule === moduleIndex && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Content Items</h3>
                      <div className="sm:flex gap-2 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => addContent(e, moduleIndex)}
                          className="flex-1 sm:flex-none border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Content
                        </Button>
                        <Button
                          type="button"
                          variant={module.quiz ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => showQuizEditorHandler(e, moduleIndex)}
                          className={module.quiz ? "flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700" : "flex-1 sm:flex-none border-gray-600 text-gray-300 hover:bg-gray-700"}
                        >
                          <HelpCircle className="h-4 w-4 mr-2" />
                          {module.quiz ? "Edit Quiz" : "Add Quiz"}
                        </Button>
                      </div>
                    </div>

                    {module.content?.map((content, contentIndex) => (
                      <ContentItem
                        key={contentIndex}
                        content={content}
                        moduleIndex={moduleIndex}
                        contentIndex={contentIndex}
                        updateContent={updateContent}
                        removeContent={removeContent}
                        API_URL={API_URL}
                        setContentFiles={setContentFiles}
                        contentFiles={contentFiles}
                        removeContentFile={removeContentFile}
                        setIsUploading={setIsUploading}
                      />
                    ))}

                    {module.quiz && showQuizEditor !== moduleIndex && (
                      <Card className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileQuestion className="h-5 w-5 text-red-500" />
                            <div>
                              <h4 className="font-medium text-gray-100 text-sm sm:text-base">Module Quiz</h4>
                              <p className="text-xs sm:text-sm text-gray-400">{module.quiz.questions.length} questions</p>
                            </div>
                          </div>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={(e) => showQuizEditorHandler(e, moduleIndex)}
                          >
                            Edit Quiz
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {showQuizEditor === moduleIndex && (
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <QuizEditor 
                    initialQuiz={module.quiz || { title: '', description: '', questions: [] }}
                    onSave={(quiz) => handleQuizSave(moduleIndex, quiz)}
                    onCancel={(e) => {
                      if (e) e.preventDefault();
                      setShowQuizEditor(null);
                    }}
                  />
                </div>
              )}
            </Card>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-600 rounded-lg">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-base sm:text-lg font-medium text-gray-300">No Modules Added Yet</h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">Start by adding your first course module</p>
              <Button type="button" onClick={addModule} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Plus className="mr-2 h-4 w-4" /> Add First Module
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CourseModuleEditor;