
// This file defines the schemas for MongoDB collections
// We'll use these as references for validation since we're using MongoClient

const courseSchema = {
  title: String,
  category: String,
  shortDescription: String,
  fullDescription: String,
  level: String, // 'beginner', 'intermediate', 'advanced'
  duration: String,
  prerequisites: Array,
  learningOutcomes: Array,
  thumbnail: String,
  facilitator: String, // ObjectId as string
  status: String, // 'draft', 'published', 'archived'
  enrolled: Number,
  rating: Number,
  reviews: Array, 
  modules: Array,
  createdAt: Date,
  updatedAt: Date
};

const userSchema = {
  name: String,
  email: String,
  password: String,
  role: String, // 'admin', 'facilitator', 'learner'
  profilePicture: String,
  bio: String,
  enrolledCourses: Array, // Array of course IDs
  createdCourses: Array, // Array of course IDs
  createdAt: Date
};

const enrollmentSchema = {
  learner: String, // ObjectId as string
  course: String, // ObjectId as string
  progress: Number,
  moduleProgress: Array,
  enrolledAt: Date,
  completedAt: Date,
  lastAccessed: Date
};

const forumPostSchema = {
  title: String,
  content: String,
  author: String, // ObjectId as string
  course: String, // ObjectId as string (optional)
  category: String,
  likes: Array, // Array of user IDs
  comments: Array,
  isCommunityPost: Boolean,
  isAnnouncement: Boolean,
  createdAt: Date,
  updatedAt: Date
};

const chatSchema = {
  participants: Array, // Array of user IDs
  isGroupChat: Boolean,
  groupName: String,
  messages: Array,
  lastMessage: Date,
  createdAt: Date
};

module.exports = {
  courseSchema,
  userSchema,
  enrollmentSchema,
  forumPostSchema,
  chatSchema
};
