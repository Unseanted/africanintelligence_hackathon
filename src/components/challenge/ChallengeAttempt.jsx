import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ChallengeAttempt = ({ challenge, onClose, onSubmit }) => {
  const [submission, setSubmission] = useState({
    answer: '',
    answers: [],
    file: null,
    url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit ? challenge.timeLimit * 60 : null);

  useEffect(() => {
    if (challenge.submissionType === 'timed-quiz' && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleSubmit();
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, challenge.submissionType]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let submissionData;
      
      switch (challenge.submissionType) {
        case 'quiz':
        case 'timed-quiz':
          submissionData = { answers: submission.answers };
          break;
        case 'document':
        case 'file':
        case 'presentation':
        case 'image':
          submissionData = { file: submission.file };
          break;
        case 'text':
          submissionData = { text: submission.answer };
          break;
        case 'url':
        case 'video':
          submissionData = { url: submission.url };
          break;
        default:
          submissionData = submission;
      }

      await onSubmit(challenge.id, submissionData);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmissionForm = () => {
    switch (challenge.submissionType) {
      case 'quiz':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Challenge Questions</h3>
            <div className="space-y-6">
              {challenge.questions?.map((question, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-start mb-4">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3 mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-lg">{question.text}</p>
                      {question.description && (
                        <p className="text-gray-600 mt-2">{question.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 ml-11">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center">
                        <input
                          type={question.multiple ? "checkbox" : "radio"}
                          id={`q${index}-opt${optIndex}`}
                          name={`question-${index}`}
                          value={option}
                          checked={submission.answers?.[index]?.includes(option)}
                          onChange={(e) => {
                            const newAnswers = [...(submission.answers || [])];
                            if (question.multiple) {
                              newAnswers[index] = e.target.checked
                                ? [...(newAnswers[index] || []), option]
                                : (newAnswers[index] || []).filter(opt => opt !== option);
                            } else {
                              newAnswers[index] = [option];
                            }
                            setSubmission({...submission, answers: newAnswers});
                          }}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer text-gray-700 hover:text-gray-900">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timed-quiz':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Timed Challenge</h3>
              <div className="px-4 py-2 bg-red-100 rounded-lg border-2 border-red-200">
                <span className="font-mono font-bold text-red-600">
                  {timeLeft ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : 'No time limit'}
                </span>
              </div>
            </div>

            {timeLeft && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">
                    Time remaining: {Math.floor(timeLeft / 60)} minutes {timeLeft % 60} seconds
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {challenge.questions?.map((question, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-xl bg-white">
                  <div className="flex items-start mb-4">
                    <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3 mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-lg">{question.text}</p>
                      {question.codeSnippet && (
                        <pre className="mt-3 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">
                          <code>{question.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                  
                  {question.type === 'code' ? (
                    <div className="ml-11">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Solution:</label>
                      <textarea
                        value={submission.answers?.[index]?.[0] || ''}
                        onChange={(e) => {
                          const newAnswers = [...(submission.answers || [])];
                          newAnswers[index] = [e.target.value];
                          setSubmission({...submission, answers: newAnswers});
                        }}
                        placeholder="Write your code here..."
                        className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        spellCheck="false"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 ml-11">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <input
                            type={question.multiple ? "checkbox" : "radio"}
                            id={`q${index}-opt${optIndex}`}
                            name={`question-${index}`}
                            value={option}
                            checked={submission.answers?.[index]?.includes(option)}
                            onChange={(e) => {
                              const newAnswers = [...(submission.answers || [])];
                              if (question.multiple) {
                                newAnswers[index] = e.target.checked
                                  ? [...(newAnswers[index] || []), option]
                                  : (newAnswers[index] || []).filter(opt => opt !== option);
                              } else {
                                newAnswers[index] = [option];
                              }
                              setSubmission({...submission, answers: newAnswers});
                            }}
                            className="mr-3 w-4 h-4 text-blue-600"
                          />
                          <label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer text-gray-700 hover:text-gray-900">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'document':
      case 'file':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Upload Your File</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setSubmission({...submission, file: e.target.files?.[0]})}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="lg">Select File</Button>
              </label>
              <p className="mt-4 text-sm text-gray-600">
                Supports PDF, DOC, DOCX, CSV, PPT, PPTX, JPG, PNG, GIF
              </p>
              {submission.file && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Selected: {submission.file.name}</p>
                  <p className="text-sm text-blue-700">
                    {(submission.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Your Response</h3>
            <div className="space-y-4">
              <textarea
                value={submission.answer}
                onChange={(e) => setSubmission({...submission, answer: e.target.value})}
                placeholder="Write your detailed response here..."
                className="w-full p-4 border border-gray-300 rounded-lg h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="text-sm text-gray-500 text-right">
                {submission.answer.length} characters
              </div>
            </div>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Submission URL</h3>
            <div className="space-y-4">
              <input
                type="url"
                value={submission.url}
                onChange={(e) => setSubmission({...submission, url: e.target.value})}
                placeholder="https://example.com/your-submission"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600">
                Please provide a valid URL to your submission
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Unknown submission type</p>
          </div>
        );
    }
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Time expired';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Submission Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your submission has been received successfully. You'll be notified when your results are available.
          </p>
          <Button onClick={onClose} className="w-full" size="lg">
            Return to Challenges
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
              <p className="text-gray-600 mt-2 text-lg">
                {challenge.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="font-medium">
                {formatTimeRemaining(challenge.endTime - Date.now())}
              </span>
            </div>
          </div>

          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">Challenge Requirements</h3>
            <p className="text-blue-800">{challenge.requirements}</p>
          </div>

          {renderSubmissionForm()}

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChallengeAttempt;