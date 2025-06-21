import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';

const ChallengeAttempt = ({ challenge, onClose, onSubmit }) => {
  const [submission, setSubmission] = useState({
    answer: '',
    file: null,
    url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let submissionData;
      
      switch (challenge.submissionType) {
        case 'quiz':
          submissionData = { answers: submission.answer };
          break;
        case 'document':
        case 'file':
          submissionData = { file: submission.file };
          break;
        case 'text':
          submissionData = { text: submission.answer };
          break;
        case 'url':
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
          <div className="space-y-4">
            <h3 className="font-semibold">Quiz Questions</h3>
            <textarea
              value={submission.answer}
              onChange={(e) => setSubmission({...submission, answer: e.target.value})}
              placeholder="Enter your answers here..."
              className="w-full p-3 border rounded-md h-64"
            />
          </div>
        );
      case 'timed-quiz':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Timed Coding Quiz</h3>
            <div className="text-sm text-amber-600 mb-2">You have a limited time to complete this quiz. Please answer all questions below.</div>
            <textarea
              value={submission.answer}
              onChange={(e) => setSubmission({...submission, answer: e.target.value})}
              placeholder="Enter your code/answers here..."
              className="w-full p-3 border rounded-md h-64"
            />
          </div>
        );
      case 'document':
      case 'file':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Your File</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setSubmission({...submission, file: e.target.files?.[0]})}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline">Select File</Button>
              </label>
              {submission.file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {submission.file.name}
                </p>
              )}
            </div>
          </div>
        );
      case 'presentation':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Your Presentation</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setSubmission({...submission, file: e.target.files?.[0]})}
                className="hidden"
                id="presentation-upload"
                accept=".pdf,.ppt,.pptx"
              />
              <label htmlFor="presentation-upload" className="cursor-pointer">
                <Button variant="outline">Select Presentation</Button>
              </label>
              {submission.file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {submission.file.name}
                </p>
              )}
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Your Image</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setSubmission({...submission, file: e.target.files?.[0]})}
                className="hidden"
                id="image-upload"
                accept=".jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline">Select Image</Button>
              </label>
              {submission.file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {submission.file.name}
                </p>
              )}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Video Submission</h3>
            <div className="mb-2 text-sm text-gray-500">Paste a video URL (YouTube, Vimeo, etc.) or upload a video file.</div>
            <input
              type="url"
              value={submission.url}
              onChange={(e) => setSubmission({...submission, url: e.target.value})}
              placeholder="https://youtube.com/yourvideo"
              className="w-full p-3 border rounded-md mb-4"
            />
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setSubmission({...submission, file: e.target.files?.[0]})}
                className="hidden"
                id="video-upload"
                accept="video/*"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Button variant="outline">Upload Video</Button>
              </label>
              {submission.file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {submission.file.name}
                </p>
              )}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Your Response</h3>
            <textarea
              value={submission.answer}
              onChange={(e) => setSubmission({...submission, answer: e.target.value})}
              placeholder="Write your response here..."
              className="w-full p-3 border rounded-md h-64"
            />
          </div>
        );
      case 'url':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Submission URL</h3>
            <input
              type="url"
              value={submission.url}
              onChange={(e) => setSubmission({...submission, url: e.target.value})}
              placeholder="https://example.com/submission"
              className="w-full p-3 border rounded-md"
            />
          </div>
        );
      default:
        return <p>Unknown submission type</p>;
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Submission Complete!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your {challenge.submissionType} submission has been received.
            You'll be notified when your results are available.
          </p>
          <Button onClick={onClose} className="w-full">
            Return to Challenges
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{challenge.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {challenge.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>{formatTimeRemaining(challenge.endTime - Date.now())}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              {challenge.requirements.map((req, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-300">{req}</li>
              ))}
            </ul>
          </div>

          {renderSubmissionForm()}

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const formatTimeRemaining = (ms) => {
  if (ms <= 0) return 'Time expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default ChallengeAttempt;