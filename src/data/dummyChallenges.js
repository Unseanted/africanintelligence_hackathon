export const dummyChallenges = [
  {
    _id: 'ch1',
    title: 'Soil Analysis Quiz',
    description: 'Test your knowledge of soil types and analysis methods.',
    points: 500,
    difficulty: 'beginner',
    category: 'Agriculture',
    submissionFormat: 'Quiz',
    duration: '30 minutes',
    course: '64a1c1a1a1a1a1a1a1a1a1a1',
    courseTitle: 'Agriculture 101',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    participants: 12,
    maxTeamSize: 1,
  },
  {
    _id: 'ch2',
    title: 'AI Image Classification',
    description: 'Build a model to classify images of crops.',
    points: 1000,
    difficulty: 'intermediate',
    category: 'AI',
    submissionFormat: 'File Upload',
    duration: '2 hours',
    course: '64a1c1a1a1a1a1a1a1a1a1a2',
    courseTitle: 'Introduction to AI',
    status: 'upcoming',
    startDate: new Date(Date.now() + 3600000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    participants: 8,
    maxTeamSize: 3,
  },
  {
    _id: 'ch3',
    title: 'Blockchain Use Case Note',
    description: 'Write a note on how blockchain can improve supply chains.',
    points: 700,
    difficulty: 'beginner',
    category: 'Blockchain',
    submissionFormat: 'Note Writing',
    duration: '1 hour',
    course: '64a1c1a1a1a1a1a1a1a1a1a3',
    courseTitle: 'Blockchain for Beginners',
    status: 'completed',
    startDate: new Date(Date.now() - 172800000).toISOString(),
    endDate: new Date(Date.now() - 86400000).toISOString(),
    participants: 5,
    maxTeamSize: 2,
  },
]; 