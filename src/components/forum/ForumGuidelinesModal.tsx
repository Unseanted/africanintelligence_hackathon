import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, MessageSquare, ThumbsUp, Flag, Star, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForumGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForumGuidelinesModal: React.FC<ForumGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const guidelines = [
    {
      title: 'Community Standards',
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      items: [
        'Be respectful and professional in all interactions',
        'No harassment, hate speech, or discriminatory content',
        'No spam, self-promotion, or off-topic content',
        'Maintain academic integrity and avoid plagiarism',
      ],
    },
    {
      title: 'Discussion Guidelines',
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
      items: [
        'Stay on topic and contribute meaningfully to discussions',
        'Use clear and concise language',
        'Provide evidence or examples to support your points',
        'Be open to constructive criticism and different viewpoints',
      ],
    },
    {
      title: 'Voting System',
      icon: <ThumbsUp className="w-5 h-5 text-yellow-500" />,
      items: [
        'Upvote helpful and well-reasoned contributions',
        'Downvote only for poor quality or incorrect information',
        'Don\'t downvote simply because you disagree',
        'Votes affect user reputation and content visibility',
      ],
    },
    {
      title: 'Reporting Content',
      icon: <Flag className="w-5 h-5 text-red-500" />,
      items: [
        'Report content that violates community guidelines',
        'Provide specific reasons for reporting',
        'False reports may affect your reputation',
        'Moderators will review reported content promptly',
      ],
    },
    {
      title: 'Reputation System',
      icon: <Star className="w-5 h-5 text-purple-500" />,
      items: [
        'Earn points for helpful contributions',
        'Gain badges for consistent positive participation',
        'Higher reputation unlocks additional privileges',
        'Maintain good standing to keep your privileges',
      ],
    },
    {
      title: 'Moderation',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      items: [
        'Moderators enforce community guidelines',
        'Content may be removed without warning',
        'Repeated violations may result in temporary or permanent bans',
        'Appeals can be made through the support system',
      ],
    },
  ];

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="relative">
                <DialogTitle className="text-2xl font-bold">Forum Guidelines</DialogTitle>
                <DialogDescription>
                  Please read and follow these guidelines to maintain a positive and productive learning environment.
                </DialogDescription>
                {/* <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose> */}
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {guidelines.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        {section.icon}
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <motion.li
                            key={itemIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: (index * 0.1) + (itemIndex * 0.05) }}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <span className="text-gray-400">•</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.6 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-sm text-gray-600">
                  By participating in the forum, you agree to follow these guidelines. Violations may result in
                  content removal, temporary suspension, or permanent ban from the platform.
                </p>
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ForumGuidelinesModal; 