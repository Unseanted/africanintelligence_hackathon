import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Users, Clock, Book, FileText, AlertCircle, HeartPulse, Briefcase, Leaf, Globe, Brain, Music, X, Sparkles, Bot } from 'lucide-react';

const ChallengeDetail = ({ challenge, onClose, onJoin, isSubmitted, isWaitlisted, onJoinWaitlist }) => {
  const categoryIcons = {
    health: <HeartPulse className="w-5 h-5 text-red-500" />,
    career: <Briefcase className="w-5 h-5 text-blue-500" />,
    relationships: <Users className="w-5 h-5 text-pink-500" />,
    environment: <Leaf className="w-5 h-5 text-green-500" />,
    learning: <Brain className="w-5 h-5 text-purple-500" />,
    creativity: <Music className="w-5 h-5 text-yellow-500" />,
    global: <Globe className="w-5 h-5 text-indigo-500" />
  };

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
      case 'quiz': return 'Interactive Quiz';
      case 'timed-quiz': return 'Timed Challenge';
      case 'document': return 'Document Upload';
      case 'presentation': return 'Presentation';
      case 'image': return 'Image Submission';
      case 'video': return 'Video Submission';
      case 'text': return 'Written Response';
      case 'url': return 'URL Submission';
      case 'file': return 'File Upload';
      default: return 'Submission';
    }
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Expired';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Grand Prize & AI Powered Badges */}
          {(challenge.isGrandPrize || challenge.type === 'ai-grand-prize' || challenge.grandPrize) && (
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <span className="font-bold text-yellow-700 text-lg">Grand Prize Challenge</span>
              {challenge.grandPrize && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold ml-2">Prize: {challenge.grandPrize}</span>
              )}
            </div>
          )}
          {challenge.aiPowered && (
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-blue-700">AI Powered</span>
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {categoryIcons[challenge.category] || <Book className="w-5 h-5 text-gray-500" />}
                <span className="text-sm font-medium text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                  {challenge.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{challenge.description}</p>
            </div>
            <Button variant="ghost" onClick={onClose} className="ml-4">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Challenge Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {challenge.status === 'active' 
                          ? `Ends in: ${formatTimeRemaining(challenge.endTime - Date.now())}`
                          : challenge.status === 'upcoming'
                          ? `Starts: ${new Date(challenge.startTime).toLocaleDateString()}`
                          : `Completed: ${new Date(challenge.endTime).toLocaleDateString()}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {challenge.status === 'active' ? 'Time remaining' : 'Schedule'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">{challenge.participants?.toLocaleString?.() ?? challenge.participants}</div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-medium text-gray-900">{challenge.maxScore} XP</div>
                      <div className="text-sm text-gray-600">Maximum reward</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getSubmissionIcon()}
                    <div>
                      <div className="font-medium text-gray-900">{getSubmissionTypeName()}</div>
                      <div className="text-sm text-gray-600">Submission type</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Requirements & Rewards</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">What you need:</h4>
                  <div className="text-gray-700">{challenge.requirements}</div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What you'll gain:</h4>
                  <div className="text-gray-700">{challenge.rewards}</div>
                </div>
              </div>

              {challenge.status === 'active' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Ready to start?</h3>
                  <p className="text-amber-700 text-sm mb-4">
                    Join {challenge.participants?.toLocaleString?.() ?? challenge.participants} others in this challenge and earn up to {challenge.maxScore} XP!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose} size="lg">
              Back to Challenges
            </Button>
            {challenge.status === 'active' && !isSubmitted && (
              <Button onClick={() => onJoin(challenge.id)} size="lg">
                Start Challenge
              </Button>
            )}
            {challenge.status === 'upcoming' && !isWaitlisted && (
              <Button onClick={() => onJoinWaitlist(challenge.id)} size="lg">
                Join Waitlist
              </Button>
            )}
            {challenge.status === 'upcoming' && isWaitlisted && (
              <Button variant="secondary" disabled size="lg">
                Waitlisted ✓
              </Button>
            )}
            {isSubmitted && (
              <Button variant="secondary" disabled size="lg">
                Submitted ✓
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChallengeDetail;