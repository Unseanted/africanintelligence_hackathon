import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Clock, Cpu, FileText, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChallengeAttempt = ({ challenge, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(challenge.timeLeft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState({
    repository: '',
    documentation: '',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(challenge.id, submission);
      setIsSubmitted(true);
      toast({
        title: "Submission Successful!",
        description: "Your solution has been submitted for review.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Submission Complete!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your solution has been submitted successfully. We'll review your submission and update you on the results.
          </p>
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-bold">{challenge.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
              </div>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Challenge Description</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
              
              <h3 className="font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                {challenge.requirements.map((req, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-300">{req}</li>
                ))}
              </ul>

              <h3 className="font-semibold mb-2">Submission Format</h3>
              <p className="text-gray-600 dark:text-gray-300">{challenge.submissionFormat}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Repository URL</label>
                <input
                  type="text"
                  value={submission.repository}
                  onChange={(e) => setSubmission(prev => ({ ...prev, repository: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Documentation</label>
                <textarea
                  value={submission.documentation}
                  onChange={(e) => setSubmission(prev => ({ ...prev, documentation: e.target.value }))}
                  placeholder="Add any additional documentation or instructions"
                  className="w-full p-2 border rounded-md h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={submission.notes}
                  onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or comments"
                  className="w-full p-2 border rounded-md h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || timeLeft <= 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const formatTime = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

export default ChallengeAttempt; 