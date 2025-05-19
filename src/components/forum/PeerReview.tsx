import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Star, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ReviewCriteria {
  id: string;
  title: string;
  description: string;
  weight: number;
}

interface Review {
  _id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  criteria: {
    criteriaId: string;
    score: number;
    feedback: string;
  }[];
  overallFeedback: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  content: string;
  status: 'pending' | 'reviewing' | 'completed';
  reviews: Review[];
  averageScore: number;
}

interface PeerReviewProps {
  assignmentId: string;
  criteria: ReviewCriteria[];
}

const PeerReview: React.FC<PeerReviewProps> = ({ assignmentId, criteria }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useTourLMS();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch submissions');

        const data = await response.json();
        setSubmissions(data);

        // Initialize review scores
        const initialScores: Record<string, number> = {};
        criteria.forEach(c => {
          initialScores[c.id] = 0;
        });
        setReviewScores(initialScores);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submissions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [token, assignmentId, criteria]);

  const handleScoreChange = (criteriaId: string, score: number) => {
    setReviewScores(prev => ({
      ...prev,
      [criteriaId]: score
    }));
  };

  const handleFeedbackChange = (criteriaId: string, feedback: string) => {
    setReviewFeedback(prev => ({
      ...prev,
      [criteriaId]: feedback
    }));
  };

  const calculateAverageScore = (scores: Record<string, number>) => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = criteria.reduce((sum, c) => {
      return sum + (scores[c.id] * c.weight);
    }, 0);
    return (weightedSum / totalWeight).toFixed(1);
  };

  const handleSubmitReview = async () => {
    if (!currentSubmission) return;

    try {
      const review = {
        submissionId: currentSubmission._id,
        criteria: criteria.map(c => ({
          criteriaId: c.id,
          score: reviewScores[c.id],
          feedback: reviewFeedback[c.id] || ''
        })),
        overallFeedback
      };

      const response = await fetch(`/api/assignments/${assignmentId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(review)
      });

      if (!response.ok) throw new Error('Failed to submit review');

      const updatedSubmission = await response.json();
      setSubmissions(prev => prev.map(s => 
        s._id === updatedSubmission._id ? updatedSubmission : s
      ));

      // Reset review form
      setCurrentSubmission(null);
      setReviewScores({});
      setReviewFeedback({});
      setOverallFeedback('');

      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!currentSubmission ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map(submission => (
            <Card key={submission._id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{submission.studentName}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  submission.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : submission.status === 'reviewing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={submission.averageScore} className="h-2" />
                    <span className="text-sm font-medium">{submission.averageScore}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Reviews</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      {submission.reviews.filter(r => r.status === 'completed').length} completed
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setCurrentSubmission(submission)}
                  disabled={submission.status === 'completed'}
                >
                  {submission.status === 'completed' ? 'Review Completed' : 'Start Review'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Review Submission</h2>
            <Button variant="outline" onClick={() => setCurrentSubmission(null)}>
              Back to Submissions
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Submission Content</h3>
              <Card className="p-4 bg-gray-50">
                <p className="whitespace-pre-wrap">{currentSubmission.content}</p>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Criteria</h3>
              {criteria.map(criterion => (
                <div key={criterion.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{criterion.title}</h4>
                      <p className="text-sm text-gray-500">{criterion.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          variant={reviewScores[criterion.id] === score ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange(criterion.id, score)}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={reviewFeedback[criterion.id] || ''}
                    onChange={(e) => handleFeedbackChange(criterion.id, e.target.value)}
                    placeholder="Provide feedback for this criterion..."
                    className="min-h-[100px]"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Overall Feedback</h3>
              <Textarea
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Provide overall feedback for the submission..."
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentSubmission(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview}>
                Submit Review
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PeerReview; 