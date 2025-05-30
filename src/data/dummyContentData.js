// data/dummyContentData.js
export const dummySubmissions = [
  {
    id: 'sub1',
    title: 'React Hooks Explained',
    content: '<p>A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.</p>',
    contentType: 'lesson',
    status: 'pending_review',
    createdAt: '2023-05-15T10:30:00Z',
    contributor: { id: 'user1', name: 'Alex Johnson' }
  },
  // ... more submissions
];

export const dummyVersions = [
  {
    id: 'ver1',
    contentId: 'cont1',
    title: 'React Fundamentals',
    content: 'Initial version of React Fundamentals lesson',
    versionNumber: 1,
    isCurrent: false,
    createdAt: '2023-04-01T08:00:00Z',
    contributor: { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' }
  },
  // ... more versions
];

export const dummyContributors = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    avatar: '/avatars/alex.jpg',
    contributions: 15,
    badges: ['Gold Contributor', 'Content Creator']
  },
  // ... more contributors
];

// Helper function to generate new submissions
export const generateNewSubmission = (title, content, contentType) => ({
  id: `sub${Math.floor(Math.random() * 1000)}`,
  title,
  content,
  contentType,
  status: 'pending_review',
  createdAt: new Date().toISOString(),
  contributor: { id: 'currentUser', name: 'You' }
});