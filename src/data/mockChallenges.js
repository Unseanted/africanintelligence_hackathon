export const mockChallenges = {
  active: [
    {
      id: 'ch1',
      title: 'AI Image Recognition Challenge',
      description: 'Build an AI model that can accurately classify images of African wildlife. The model should be able to distinguish between at least 10 different species.',
      timeLeft: 3600000, // 1 hour in milliseconds
      participants: 45,
      maxScore: 1000,
      difficulty: 'Advanced',
      category: 'Machine Learning',
      requirements: [
        'Python knowledge',
        'Basic understanding of CNN',
        'Dataset handling experience'
      ],
      submissionFormat: 'GitHub repository with Jupyter notebook',
      deadline: new Date(Date.now() + 3600000).toISOString()
    },
    {
      id: 'ch2',
      title: 'NLP Text Classification',
      description: 'Create a text classification model for African languages. The model should be able to classify text into different categories in at least 3 African languages.',
      timeLeft: 7200000, // 2 hours in milliseconds
      participants: 32,
      maxScore: 800,
      difficulty: 'Intermediate',
      category: 'Natural Language Processing',
      requirements: [
        'Python knowledge',
        'NLP basics',
        'Multilingual text processing'
      ],
      submissionFormat: 'Python script with documentation',
      deadline: new Date(Date.now() + 7200000).toISOString()
    }
  ],
  upcoming: [
    {
      id: 'ch3',
      title: 'Blockchain for Agriculture',
      description: 'Design a blockchain solution for tracking agricultural supply chains in Africa. Focus on transparency and efficiency.',
      timeLeft: 86400000, // 24 hours in milliseconds
      participants: 0,
      maxScore: 1200,
      difficulty: 'Advanced',
      category: 'Blockchain',
      requirements: [
        'Blockchain basics',
        'Smart contract development',
        'Supply chain knowledge'
      ],
      submissionFormat: 'Smart contract code and documentation',
      deadline: new Date(Date.now() + 86400000).toISOString()
    }
  ],
  completed: [
    {
      id: 'ch4',
      title: 'Mobile App Development',
      description: 'Develop a mobile app for local market vendors to manage their inventory and sales.',
      timeLeft: 0,
      participants: 28,
      maxScore: 1000,
      difficulty: 'Intermediate',
      category: 'Mobile Development',
      requirements: [
        'React Native',
        'Firebase',
        'UI/UX design'
      ],
      submissionFormat: 'APK file and source code',
      deadline: new Date(Date.now() - 86400000).toISOString(),
      winner: 'Team Alpha',
      topParticipants: [
        { team: 'Team Alpha', score: 950 },
        { team: 'Team Beta', score: 920 },
        { team: 'Team Gamma', score: 890 }
      ]
    }
  ]
}; 