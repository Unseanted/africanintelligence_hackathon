import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Clock, Cpu, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChallengeDetail = ({ challenge, onClose, onJoin }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    setIsSubmitting(true);
    try {
      await onJoin(challenge.id);
      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined the challenge. Good luck!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the challenge. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-500" />
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
                <span>Time Left: {formatTime(challenge.timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{challenge.participants} Participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{challenge.maxScore} Points</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Difficulty: {challenge.difficulty}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Category</h3>
              <p className="text-gray-600 dark:text-gray-300">{challenge.category}</p>
              
              <h3 className="font-semibold">Submission Format</h3>
              <p className="text-gray-600 dark:text-gray-300">{challenge.submissionFormat}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{challenge.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              {challenge.requirements.map((req, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-300">{req}</li>
              ))}
            </ul>
          </div>

          {challenge.topParticipants && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Top Participants</h3>
              <div className="space-y-2">
                {challenge.topParticipants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span>{participant.team}</span>
                    <span className="font-medium">{participant.score} points</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleJoin}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Joining...' : 'Join Challenge'}
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

export default ChallengeDetail; 