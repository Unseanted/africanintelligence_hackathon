export const getMockChallenges = () => {
  const now = Date.now();
  const oneHour = 3600000;
  const oneDay = 86400000;
  const oneWeek = 604800000;

  return {
    active: [
      {
        id: 'ch-1',
        title: 'Agriculture Fundamentals Quiz',
        description: 'Test your knowledge of basic agricultural concepts with this timed quiz.',
        courseId: 'ag-101',
        courseTitle: 'Introduction to Agriculture',
        startTime: now - oneHour,
        endTime: now + oneDay,
        maxScore: 100,
        participants: 42,
        status: 'active',
        submissionType: 'quiz',
        requirements: [
          'Complete all 20 multiple-choice questions',
          'Score at least 70% to pass',
          'Time limit: 30 minutes'
        ],
        difficulty: 'beginner',
        category: 'Knowledge Check',
        tags: ['quiz', 'fundamentals']
      },
      {
        id: 'ch-2',
        title: 'Crop Rotation Case Study',
        description: 'Analyze and document a successful crop rotation implementation.',
        courseId: 'ag-201',
        courseTitle: 'Advanced Agricultural Techniques',
        startTime: now - oneDay,
        endTime: now + oneWeek,
        maxScore: 150,
        participants: 28,
        status: 'active',
        submissionType: 'document',
        requirements: [
          '3-5 page case study',
          'Include before/after yield data',
          'Cite at least 3 academic sources'
        ],
        difficulty: 'intermediate',
        category: 'Research',
        tags: ['case study', 'crop rotation']
      },
      {
        id: 'ch-5',
        title: 'Farm Equipment Video Submission',
        description: 'Create a short video demonstrating proper use of farm equipment.',
        courseId: 'ag-102',
        courseTitle: 'Agricultural Equipment',
        startTime: now - oneDay,
        endTime: now + 3 * oneDay,
        maxScore: 200,
        participants: 18,
        status: 'active',
        submissionType: 'url',
        requirements: [
          '3-5 minute video',
          'Demonstrate safety procedures',
          'Upload to YouTube/Vimeo and submit link'
        ],
        difficulty: 'intermediate',
        category: 'Practical',
        tags: ['video', 'equipment']
      },
      {
        id: 'ch-8',
        title: 'Irrigation System Design',
        description: 'Design an efficient irrigation system for a small farm and submit your plan.',
        courseId: 'ag-103',
        courseTitle: 'Water Management in Agriculture',
        startTime: now - 2 * oneHour,
        endTime: now + 2 * oneDay,
        maxScore: 180,
        participants: 25,
        status: 'active',
        submissionType: 'document',
        requirements: [
          'Include a diagram of your system',
          'Explain water-saving features',
          'Estimate cost and water usage'
        ],
        difficulty: 'advanced',
        category: 'Design',
        tags: ['irrigation', 'design']
      },
      {
        id: 'ch-9',
        title: 'Compost Creation Photo Submission',
        description: 'Create compost and submit a series of photos documenting the process.',
        courseId: 'ag-104',
        courseTitle: 'Organic Farming Basics',
        startTime: now - oneHour,
        endTime: now + oneDay,
        maxScore: 90,
        participants: 10,
        status: 'active',
        submissionType: 'file',
        requirements: [
          'At least 3 photos: start, mid, and finished compost',
          'Brief description of materials used',
          'Describe the composting method'
        ],
        difficulty: 'beginner',
        category: 'Practical',
        tags: ['compost', 'organic']
      },
      {
        id: 'tech-1',
        title: 'JavaScript Coding Sprint',
        description: 'Solve 5 JavaScript problems in 20 minutes. Fastest correct solutions win!',
        courseId: 'tech-101',
        courseTitle: 'Web Development Basics',
        startTime: now - oneHour,
        endTime: now + 6 * oneHour,
        maxScore: 120,
        participants: 30,
        status: 'active',
        submissionType: 'timed-quiz',
        requirements: [
          'Complete all 5 problems',
          'Automatic timer: 20 minutes',
          'Submit code for each problem'
        ],
        difficulty: 'intermediate',
        category: 'Technology',
        tags: ['coding', 'quiz', 'timer']
      },
      {
        id: 'bus-1',
        title: 'Startup Pitch Deck',
        description: 'Create and upload a pitch deck for your startup idea.',
        courseId: 'bus-101',
        courseTitle: 'Entrepreneurship 101',
        startTime: now - 2 * oneHour,
        endTime: now + 2 * oneDay,
        maxScore: 150,
        participants: 18,
        status: 'active',
        submissionType: 'presentation',
        requirements: [
          'Upload a PDF or PPTX file',
          'Max 10 slides',
          'Include business model and market analysis'
        ],
        difficulty: 'beginner',
        category: 'Business',
        tags: ['presentation', 'startup']
      },
      {
        id: 'health-1',
        title: 'Healthy Meal Photo Challenge',
        description: 'Prepare a healthy meal and upload a photo with a short description.',
        courseId: 'health-101',
        courseTitle: 'Nutrition Basics',
        startTime: now - oneHour,
        endTime: now + oneDay,
        maxScore: 80,
        participants: 22,
        status: 'active',
        submissionType: 'image',
        requirements: [
          'Upload a clear photo of your meal',
          'Describe the ingredients and nutritional value',
          'Creativity counts!'
        ],
        difficulty: 'beginner',
        category: 'Health',
        tags: ['photo', 'nutrition']
      },
      {
        id: 'sci-1',
        title: 'Physics Lab Report',
        description: 'Conduct a pendulum experiment and upload your lab report.',
        courseId: 'sci-101',
        courseTitle: 'Physics Fundamentals',
        startTime: now - 2 * oneHour,
        endTime: now + 2 * oneDay,
        maxScore: 110,
        participants: 16,
        status: 'active',
        submissionType: 'document',
        requirements: [
          'Describe your setup and procedure',
          'Include data tables and graphs',
          'Discuss sources of error'
        ],
        difficulty: 'intermediate',
        category: 'Science',
        tags: ['lab', 'physics', 'report']
      },
      {
        id: 'arts-1',
        title: 'Still Life Drawing',
        description: 'Draw a still life and upload a photo of your artwork.',
        courseId: 'arts-101',
        courseTitle: 'Introduction to Drawing',
        startTime: now - oneHour,
        endTime: now + 3 * oneDay,
        maxScore: 95,
        participants: 12,
        status: 'active',
        submissionType: 'image',
        requirements: [
          'Upload a clear photo of your drawing',
          'Use pencil or charcoal',
          'Include a short description of your process'
        ],
        difficulty: 'beginner',
        category: 'Arts',
        tags: ['drawing', 'art', 'image']
      },
      {
        id: 'tech-3',
        title: 'AI in Everyday Life Presentation',
        description: 'Create a presentation on how AI impacts daily activities.',
        courseId: 'tech-301',
        courseTitle: 'Artificial Intelligence Basics',
        startTime: now - oneHour,
        endTime: now + 2 * oneDay,
        maxScore: 130,
        participants: 20,
        status: 'active',
        submissionType: 'presentation',
        requirements: [
          'Upload a PDF or PPTX',
          '5-8 slides',
          'Include at least 3 real-world examples'
        ],
        difficulty: 'beginner',
        category: 'Technology',
        tags: ['ai', 'presentation']
      },
    ],
    upcoming: [
      {
        id: 'ch-3',
        title: 'Soil Composition Analysis',
        description: 'Conduct a soil analysis and submit your findings.',
        courseId: 'ag-101',
        courseTitle: 'Introduction to Agriculture',
        startTime: now + oneDay,
        endTime: now + oneWeek,
        maxScore: 120,
        participants: 15,
        status: 'upcoming',
        submissionType: 'file',
        requirements: [
          'Submit lab results as PDF',
          'Include pH and nutrient levels',
          'Provide recommendations for improvement'
        ],
        difficulty: 'beginner',
        category: 'Lab Work',
        tags: ['soil', 'analysis']
      },
      {
        id: 'ch-6',
        title: 'Pest Management Plan',
        description: 'Develop a comprehensive pest management plan for a hypothetical farm.',
        courseId: 'ag-202',
        courseTitle: 'Integrated Pest Management',
        startTime: now + 2 * oneDay,
        endTime: now + 2 * oneWeek,
        maxScore: 180,
        participants: 22,
        status: 'upcoming',
        submissionType: 'document',
        requirements: [
          '5-7 page plan',
          'Include organic and chemical options',
          'Address at least 3 common pests'
        ],
        difficulty: 'advanced',
        category: 'Planning',
        tags: ['pest control', 'management']
      },
      {
        id: 'ch-10',
        title: 'Weather Data Analysis',
        description: 'Analyze provided weather data and predict crop yield.',
        courseId: 'ag-105',
        courseTitle: 'Agro-Meteorology',
        startTime: now + 3 * oneDay,
        endTime: now + 10 * oneDay,
        maxScore: 160,
        participants: 0,
        status: 'upcoming',
        submissionType: 'document',
        requirements: [
          'Use the provided dataset',
          'Submit a report with graphs and predictions',
          'Explain your methodology'
        ],
        difficulty: 'intermediate',
        category: 'Analysis',
        tags: ['weather', 'data', 'analysis']
      },
      {
        id: 'ch-11',
        title: 'Farm Safety Quiz',
        description: 'Complete a quiz on farm safety best practices.',
        courseId: 'ag-102',
        courseTitle: 'Agricultural Equipment',
        startTime: now + 2 * oneDay,
        endTime: now + 5 * oneDay,
        maxScore: 80,
        participants: 0,
        status: 'upcoming',
        submissionType: 'quiz',
        requirements: [
          'Answer all 15 questions',
          'Score at least 60% to pass',
          'Time limit: 20 minutes'
        ],
        difficulty: 'beginner',
        category: 'Safety',
        tags: ['quiz', 'safety']
      },
      {
        id: 'env-1',
        title: 'Plastic-Free Week Vlog',
        description: 'Record a short video diary of your experience living plastic-free for a week.',
        courseId: 'env-101',
        courseTitle: 'Environmental Awareness',
        startTime: now + 2 * oneDay,
        endTime: now + 9 * oneDay,
        maxScore: 100,
        participants: 0,
        status: 'upcoming',
        submissionType: 'video',
        requirements: [
          'Video should be 3-5 minutes',
          'Share your challenges and tips',
          'Upload as a YouTube or Vimeo link'
        ],
        difficulty: 'beginner',
        category: 'Environment',
        tags: ['video', 'vlog', 'plastic-free']
      },
      {
        id: 'tech-2',
        title: 'Mobile App Demo',
        description: 'Build a simple mobile app and upload a screen recording demo.',
        courseId: 'tech-201',
        courseTitle: 'Mobile App Development',
        startTime: now + 3 * oneDay,
        endTime: now + 10 * oneDay,
        maxScore: 200,
        participants: 0,
        status: 'upcoming',
        submissionType: 'video',
        requirements: [
          'Screen recording of your app in action',
          'Brief voiceover or captions explaining features',
          'Submit as a video file or link'
        ],
        difficulty: 'intermediate',
        category: 'Technology',
        tags: ['app', 'demo', 'video']
      },
      {
        id: 'health-3',
        title: 'First Aid Basics Timed Quiz',
        description: 'Test your knowledge of first aid procedures in a 15-minute timed quiz.',
        courseId: 'health-301',
        courseTitle: 'First Aid Essentials',
        startTime: now + 2 * oneDay,
        endTime: now + 5 * oneDay,
        maxScore: 70,
        participants: 0,
        status: 'upcoming',
        submissionType: 'timed-quiz',
        requirements: [
          'Complete all 10 questions',
          'Automatic timer: 15 minutes',
          'Score at least 60% to pass'
        ],
        difficulty: 'beginner',
        category: 'Health',
        tags: ['quiz', 'timed', 'first aid']
      },
      {
        id: 'bus-3',
        title: 'Elevator Pitch Video',
        description: 'Record a 60-second video pitching your business idea.',
        courseId: 'bus-201',
        courseTitle: 'Business Communication',
        startTime: now + 3 * oneDay,
        endTime: now + 8 * oneDay,
        maxScore: 85,
        participants: 0,
        status: 'upcoming',
        submissionType: 'video',
        requirements: [
          'Video must be under 60 seconds',
          'Clearly state your business idea',
          'Upload as a YouTube or Vimeo link'
        ],
        difficulty: 'intermediate',
        category: 'Business',
        tags: ['video', 'pitch']
      },
      {
        id: 'sci-2',
        title: 'Chemistry Data Analysis',
        description: 'Analyze the provided dataset and upload your results as a CSV file.',
        courseId: 'sci-201',
        courseTitle: 'Chemistry Lab Skills',
        startTime: now + 4 * oneDay,
        endTime: now + 9 * oneDay,
        maxScore: 100,
        participants: 0,
        status: 'upcoming',
        submissionType: 'file',
        requirements: [
          'Download the dataset',
          'Analyze and upload your results as CSV',
          'Include a summary of findings'
        ],
        difficulty: 'intermediate',
        category: 'Science',
        tags: ['chemistry', 'data', 'file']
      },
    ],
    completed: [
      {
        id: 'ch-4',
        title: 'Sustainable Farming Essay',
        description: 'Write an essay on sustainable farming practices.',
        courseId: 'ag-201',
        courseTitle: 'Advanced Agricultural Techniques',
        startTime: now - oneWeek * 2,
        endTime: now - oneWeek,
        maxScore: 130,
        participants: 35,
        status: 'completed',
        submissionType: 'text',
        requirements: [
          '1000-1500 word essay',
          'MLA format',
          'Include references'
        ],
        difficulty: 'intermediate',
        category: 'Writing',
        tags: ['essay', 'sustainability']
      },
      {
        id: 'ch-7',
        title: 'Farm Business Plan',
        description: 'Create a business plan for a startup farm.',
        courseId: 'ag-301',
        courseTitle: 'Agricultural Business',
        startTime: now - oneWeek * 3,
        endTime: now - oneWeek,
        maxScore: 250,
        participants: 12,
        status: 'completed',
        submissionType: 'document',
        requirements: [
          '10-15 page business plan',
          'Include financial projections',
          'Detail marketing strategy'
        ],
        difficulty: 'advanced',
        category: 'Business',
        tags: ['business plan', 'finance']
      },
      {
        id: 'ch-12',
        title: 'Greenhouse Construction Plan',
        description: 'Submit a construction plan for a small greenhouse.',
        courseId: 'ag-106',
        courseTitle: 'Protected Cultivation',
        startTime: now - 3 * oneWeek,
        endTime: now - 2 * oneWeek,
        maxScore: 200,
        participants: 20,
        status: 'completed',
        submissionType: 'document',
        requirements: [
          'Include materials list',
          'Provide a construction timeline',
          'Attach a sketch or diagram'
        ],
        difficulty: 'advanced',
        category: 'Construction',
        tags: ['greenhouse', 'construction']
      },
      {
        id: 'ch-13',
        title: 'Soil pH Measurement Video',
        description: 'Record a video demonstrating how to measure soil pH.',
        courseId: 'ag-101',
        courseTitle: 'Introduction to Agriculture',
        startTime: now - 2 * oneWeek,
        endTime: now - oneWeek,
        maxScore: 110,
        participants: 8,
        status: 'completed',
        submissionType: 'url',
        requirements: [
          'Video should be 2-4 minutes',
          'Show all steps of the process',
          'Explain the results briefly'
        ],
        difficulty: 'beginner',
        category: 'Lab Work',
        tags: ['video', 'soil', 'ph']
      },
      {
        id: 'bus-2',
        title: 'Marketing Basics Quiz',
        description: 'Test your knowledge of marketing fundamentals with this quiz.',
        courseId: 'bus-102',
        courseTitle: 'Marketing Principles',
        startTime: now - 2 * oneWeek,
        endTime: now - oneWeek,
        maxScore: 90,
        participants: 40,
        status: 'completed',
        submissionType: 'quiz',
        requirements: [
          'Answer all 20 questions',
          'Score at least 60% to pass',
          'Time limit: 25 minutes'
        ],
        difficulty: 'beginner',
        category: 'Business',
        tags: ['quiz', 'marketing']
      },
      {
        id: 'health-2',
        title: 'Personal Fitness Plan',
        description: 'Create a 4-week fitness plan and upload as a document.',
        courseId: 'health-201',
        courseTitle: 'Fitness and Wellness',
        startTime: now - 3 * oneWeek,
        endTime: now - 2 * oneWeek,
        maxScore: 110,
        participants: 15,
        status: 'completed',
        submissionType: 'document',
        requirements: [
          'Include weekly goals and activities',
          'Explain how you will track progress',
          'Upload as PDF or DOCX'
        ],
        difficulty: 'intermediate',
        category: 'Health',
        tags: ['fitness', 'plan', 'document']
      },
      {
        id: 'arts-2',
        title: 'Art History Presentation',
        description: 'Create a presentation on a famous artist and their impact.',
        courseId: 'arts-201',
        courseTitle: 'Art History',
        startTime: now - 3 * oneWeek,
        endTime: now - 2 * oneWeek,
        maxScore: 90,
        participants: 14,
        status: 'completed',
        submissionType: 'presentation',
        requirements: [
          '5-7 slides',
          'Include images of artwork',
          'Discuss the artist\'s influence'
        ],
        difficulty: 'beginner',
        category: 'Arts',
        tags: ['presentation', 'art history']
      },
      {
        id: 'sci-3',
        title: 'Biology Concepts Quiz',
        description: 'Test your understanding of cell biology and genetics.',
        courseId: 'sci-301',
        courseTitle: 'Biology Basics',
        startTime: now - 2 * oneWeek,
        endTime: now - oneWeek,
        maxScore: 80,
        participants: 19,
        status: 'completed',
        submissionType: 'quiz',
        requirements: [
          'Answer all 15 questions',
          'Score at least 70% to pass',
          'Time limit: 20 minutes'
        ],
        difficulty: 'beginner',
        category: 'Science',
        tags: ['biology', 'quiz']
      },
      {
        id: 'tech-4',
        title: 'Cloud Computing Report',
        description: 'Write a report on the benefits and risks of cloud computing.',
        courseId: 'tech-401',
        courseTitle: 'Cloud Technologies',
        startTime: now - 4 * oneWeek,
        endTime: now - 3 * oneWeek,
        maxScore: 120,
        participants: 11,
        status: 'completed',
        submissionType: 'document',
        requirements: [
          '3-4 pages',
          'Discuss at least 2 cloud providers',
          'Include a risk assessment section'
        ],
        difficulty: 'intermediate',
        category: 'Technology',
        tags: ['cloud', 'report', 'document']
      },
    ]
  };
};

export const mockUserCourses = [
  {
    id: 'ag-101',
    title: 'Introduction to Agriculture',
    instructor: 'Dr. Jane Smith',
    progress: 65
  },
  {
    id: 'ag-201',
    title: 'Advanced Agricultural Techniques',
    instructor: 'Prof. John Doe',
    progress: 30
  },
  {
    id: 'ag-102',
    title: 'Agricultural Equipment',
    instructor: 'Prof. Robert Johnson',
    progress: 45
  },
  {
    id: 'ag-202',
    title: 'Integrated Pest Management',
    instructor: 'Dr. Sarah Williams',
    progress: 10
  },
  {
    id: 'ag-301',
    title: 'Agricultural Business',
    instructor: 'Prof. Michael Brown',
    progress: 80
  }
];