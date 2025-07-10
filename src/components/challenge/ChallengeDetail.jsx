import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, Book, FileText, AlertCircle } from 'lucide-react';

const ChallengeDetail = ({ challenge, onClose, onJoin, isSubmitted, isWaitlisted, onJoinWaitlist }) => {
  const getSubmissionIcon = () => {
    switch (challenge.submissionType) {
      case 'quiz': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'timed-quiz': return <Clock className="w-5 h-5 text-red-500" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'presentation': return <FileText className="w-5 h-5 text-pink-500" />;
      case 'image': return <FileText className="w-5 h-5 text-green-500" />;
      case 'video': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'text': return <FileText className="w-5 h-5 text-green-500" />;
      case 'url': return <FileText className="w-5 h-5 text-red-500" />;
      case 'file': return <FileText className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSubmissionTypeName = () => {
    switch (challenge.submissionType) {
      case 'quiz': return 'Online Quiz';
      case 'timed-quiz': return 'Timed Coding Quiz';
      case 'document': return 'Document Upload';
      case 'presentation': return 'Presentation Upload';
      case 'image': return 'Image Upload';
      case 'video': return 'Video Submission';
      case 'text': return 'Text Response';
      case 'url': return 'URL Submission';
      case 'file': return 'File Upload';
      default: return 'Submission';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500">{challenge.courseTitle}</span>
              </div>
              <h2 className="text-2xl font-bold">{challenge.title}</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>
                  {challenge.status === 'active' 
                    ? `Ends in: ${formatTimeRemaining(challenge.endTime - Date.now())}`
                    : challenge.status === 'upcoming'
                    ? `Starts: ${new Date(challenge.startTime).toLocaleDateString()}`
                    : `Completed on: ${new Date(challenge.endTime).toLocaleDateString()}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{challenge.participants} Participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Max Score: {challenge.maxScore} points</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Difficulty: {challenge.difficulty}</span>
              </div>
              <div className="flex items-center gap-2">
                {getSubmissionIcon()}
                <span>Submission Type: {getSubmissionTypeName()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{challenge.description}</p>
              
              <h3 className="font-semibold">Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                {challenge.requirements.map((req, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-300">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
            {challenge.status === 'active' && !isSubmitted && (
              <Button onClick={() => onJoin(challenge.id)}>
                Start Challenge
              </Button>
            )}
            {challenge.status === 'upcoming' && !isWaitlisted && (
              <Button onClick={() => onJoinWaitlist(challenge.id)}>
                Join Waitlist
              </Button>
            )}
            {challenge.status === 'upcoming' && isWaitlisted && (
              <Button variant="secondary" disabled>
                Waiting...
              </Button>
            )}
            {isSubmitted && (
              <Button variant="secondary" disabled>
                Already Submitted
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const formatTimeRemaining = (ms) => {
  if (ms <= 0) return 'Expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default ChallengeDetail;