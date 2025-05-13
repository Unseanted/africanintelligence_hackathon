
# Tourism LMS Server

This is the backend server for the Tourism & Hospitality Learning Management System.

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root of the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tourism-lms
   JWT_SECRET=your_secret_key
   ```

3. Start the server:
   ```
   npm start
   ```

   For development with automatic restarts:
   ```
   npm run dev
   ```

## API Endpoints

The server provides the following main API endpoints:

- **Authentication**: `/api/auth`
  - Register: POST `/api/auth/register`
  - Login: POST `/api/auth/login`

- **Courses**: `/api/courses`
  - Get all courses: GET `/api/courses`
  - Get course by ID: GET `/api/courses/:id`
  - Create course: POST `/api/courses`
  - Update course: PUT `/api/courses/:id`
  - Delete course: DELETE `/api/courses/:id`
  - Enroll in course: POST `/api/courses/:id/enroll`

- **Facilitator**: `/api/facilitator`
  - Get facilitator courses: GET `/api/facilitator/courses`
  - Get course students: GET `/api/facilitator/courses/:id/students`
  - Get course analytics: GET `/api/facilitator/courses/:id/analytics`
  - Get dashboard stats: GET `/api/facilitator/dashboard`

- **Learner**: `/api/learner`
  - Get enrolled courses: GET `/api/learner/courses`
  - Get course progress: GET `/api/learner/courses/:id/progress`
  - Get dashboard stats: GET `/api/learner/dashboard`

- **Admin**: `/api/admin`
  - Get all users: GET `/api/admin/users`
  - Get user by ID: GET `/api/admin/users/:id`
  - Update user: PUT `/api/admin/users/:id`
  - Delete user: DELETE `/api/admin/users/:id`
  - Get dashboard stats: GET `/api/admin/dashboard`

- **Forum**: `/api/forum`
  - Get community posts: GET `/api/forum/community`
  - Get course posts: GET `/api/forum/course/:courseId`
  - Create post: POST `/api/forum`
  - Add comment: POST `/api/forum/:id/comments`
  - Like/unlike post: PUT `/api/forum/:id/like`

- **Chat**: `/api/chat`
  - Get user chats: GET `/api/chat`
  - Get chat messages: GET `/api/chat/:id`
  - Create chat: POST `/api/chat`
  - Send message: POST `/api/chat/:id/messages`
  - Get available users: GET `/api/chat/users/available`

## Socket.IO Events

The server handles the following Socket.IO events:

- `user_connected`: When a user connects to the socket
- `join_course`: Join a course room for real-time updates
- `join_forum`: Join a forum room for real-time updates
- `private_message`: Send a private message to another user
- `course_message`: Send a message in a course forum
- `forum_message`: Send a message in a community forum

## Database Models

The server uses MongoDB with the following main models:

- User
- Course
- Enrollment
- ForumPost
- Chat
