// forumData.js
import {
  UserRoles,
  VoteTypes,
  AssignmentStatus,
  ReviewStatus,
} from "../types/forumTypes";

// Required env: VITE_AVATAR_URL
const AVATAR_URL =
  import.meta.env.VITE_AVATAR_URL || "https://i.pravatar.cc/150";

// Enhanced user data with reputation points
export const forumUsers = [
  {
    id: "user-1",
    name: "Maria Johnson",
    role: UserRoles.STUDENT,
    reputation: 450,
    avatar: `${AVATAR_URL}?img=1`,
    joinDate: "2023-01-15",
  },
  {
    id: "user-2",
    name: "Dr. Michael Chen",
    role: UserRoles.FACILITATOR,
    reputation: 1200,
    avatar: `${AVATAR_URL}?img=2`,
    joinDate: "2022-09-10",
  },
  {
    id: "user-3",
    name: "James Wilson",
    role: UserRoles.STUDENT,
    reputation: 320,
    avatar: `${AVATAR_URL}?img=3`,
    joinDate: "2023-03-22",
  },
  {
    id: "user-4",
    name: "Alex Thompson",
    role: UserRoles.STUDENT,
    reputation: 280,
    avatar: `${AVATAR_URL}?img=4`,
    joinDate: "2023-02-18",
  },
  {
    id: "user-5",
    name: "Emma Rodriguez",
    role: UserRoles.MODERATOR,
    reputation: 950,
    avatar: `${AVATAR_URL}?img=5`,
    joinDate: "2022-11-05",
  },
  {
    id: "user-6",
    name: "Samuel Adebayo",
    role: UserRoles.STUDENT,
    reputation: 380,
    avatar: `${AVATAR_URL}?img=6`,
    joinDate: "2023-04-30",
  },
];

// Enhanced forum categories
export const forumCategories = [
  {
    id: 1,
    name: "General Discussion",
    description: "General topics related to smart tourism and hospitality",
    icon: "MessageSquare",
    moderators: ["user-5"],
  },
  {
    id: 2,
    name: "Technology Trends",
    description: "Discussions on the latest technology in tourism",
    icon: "Cpu",
    moderators: ["user-2"],
  },
  {
    id: 3,
    name: "AI in Hospitality",
    description: "Artificial intelligence applications in hospitality",
    icon: "Brain",
    moderators: ["user-2", "user-5"],
  },
  {
    id: 4,
    name: "Virtual Reality",
    description: "VR applications in tourism marketing",
    icon: "Headset",
    moderators: ["user-5"],
  },
  {
    id: 5,
    name: "Data Analytics",
    description: "Using data to enhance tourism services",
    icon: "BarChart",
    moderators: [],
  },
];

// Enhanced forum topics with voting and threading
export const forumTopics = [
  {
    id: 1,
    title: "How will AI transform guest experiences in the future?",
    author: "user-1",
    date: "2023-06-15",
    replies: 8,
    views: 245,
    categoryId: 3,
    content:
      "I've been studying the AI-Powered Customer Experience course and I'm curious about everyone's thoughts...",
    isFeatured: true,
    isPinned: false,
    isClosed: false,
    votes: [
      { userId: "user-2", vote: VoteTypes.UPVOTE },
      { userId: "user-3", vote: VoteTypes.UPVOTE },
      { userId: "user-4", vote: VoteTypes.UPVOTE },
    ],
    tags: ["AI", "Future Trends", "Guest Experience"],
    assignments: [
      {
        id: "assign-1",
        userId: "user-3",
        status: AssignmentStatus.COMPLETED,
        dueDate: "2023-07-01",
        assignedBy: "user-2",
      },
    ],
    comments: [
      {
        id: 101,
        author: "user-2",
        date: "2023-06-15",
        content:
          "Great question, Maria! I believe personalized recommendations...",
        votes: [
          { userId: "user-1", vote: VoteTypes.UPVOTE },
          { userId: "user-4", vote: VoteTypes.UPVOTE },
        ],
        isAccepted: true,
        replies: [
          {
            id: 1011,
            author: "user-1",
            date: "2023-06-15",
            content: "Thanks Dr. Chen! That makes a lot of sense...",
            votes: [],
          },
        ],
      },
      {
        id: 102,
        author: "user-3",
        date: "2023-06-16",
        content: "I think voice-activated room controls...",
        votes: [{ userId: "user-1", vote: VoteTypes.UPVOTE }],
        isAccepted: false,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: "Best VR tools for creating virtual hotel tours",
    author: "user-4",
    date: "2023-06-10",
    replies: 12,
    views: 310,
    categoryId: 4,
    content: "I'm working on a project to create virtual tours...",
    isFeatured: false,
    isPinned: true,
    isClosed: false,
    votes: [
      { userId: "user-1", vote: VoteTypes.UPVOTE },
      { userId: "user-3", vote: VoteTypes.UPVOTE },
    ],
    tags: ["VR", "Tools", "Hotel Tours"],
    assignments: [],
    comments: [
      {
        id: 201,
        author: "user-5",
        date: "2023-06-10",
        content: "Hi Alex, I've used both Matterport and 3DVista...",
        votes: [
          { userId: "user-4", vote: VoteTypes.UPVOTE },
          { userId: "user-2", vote: VoteTypes.UPVOTE },
        ],
        isAccepted: true,
        replies: [],
      },
    ],
  },
];

// Peer review assignments
export const peerReviews = [
  {
    id: "review-1",
    assignmentId: "assign-1",
    reviewerId: "user-4",
    revieweeId: "user-3",
    status: ReviewStatus.APPROVED,
    submissionDate: "2023-06-20",
    reviewDate: "2023-06-22",
    rating: 4,
    feedback:
      "Good analysis but could benefit from more concrete examples of AI implementations in Nigerian hotels.",
    criteria: [
      { name: "Depth of Analysis", score: 4 },
      { name: "Relevance to Context", score: 3 },
      { name: "Originality", score: 5 },
    ],
  },
];

// Moderation actions
export const moderationLogs = [
  {
    id: "mod-1",
    moderatorId: "user-5",
    action: "PIN_TOPIC",
    targetId: "2",
    reason: "Highly relevant for current course module",
    date: "2023-06-11",
  },
  {
    id: "mod-2",
    moderatorId: "user-2",
    action: "ACCEPT_ANSWER",
    targetId: "101",
    reason: "Most comprehensive and accurate response",
    date: "2023-06-16",
  },
];
