let express = require("express");
let router = express.Router();
let { ObjectId } = require("mongodb");
let auth = require("../middleware/auth");
let roleAuth = require("../middleware/roleAuth");
let { datemap, clg } = require("./basics");
const { body } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Course = require("../models/Course");

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - shortDescription
 *         - difficulty
 *         - facilitator
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the course
 *         title:
 *           type: string
 *           description: The title of the course
 *         category:
 *           type: string
 *           description: The category of the course
 *         shortDescription:
 *           type: string
 *           description: A brief description of the course
 *         fullDescription:
 *           type: string
 *           description: A detailed description of the course
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: The difficulty level of the course
 *         duration:
 *           type: string
 *           description: The duration of the course
 *         prerequisites:
 *           type: string
 *           description: Prerequisites for taking the course
 *         learningOutcomes:
 *           type: string
 *           description: Expected learning outcomes
 *         thumbnail:
 *           type: string
 *           description: URL of the course thumbnail
 *         facilitator:
 *           type: string
 *           description: ID of the course facilitator
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           description: The current status of the course
 *         forum:
 *           type: string
 *           description: ID of the associated forum
 *         enrollments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of enrollment IDs
 *         announcements:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of course announcements
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           default: 0
 *           description: Average course rating
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID of the user who wrote the review
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating given by the user
 *               comment:
 *                 type: string
 *                 description: Review comment
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the review
 *         modules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Module title
 *               description:
 *                 type: string
 *                 description: Module description
 *               content:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [video, document]
 *                       description: Type of content
 *                     title:
 *                       type: string
 *                       description: Content title
 *                     url:
 *                       type: string
 *                       description: Content URL
 *                     description:
 *                       type: string
 *                       description: Content description
 *               quiz:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Quiz title
 *                   description:
 *                     type: string
 *                     description: Quiz description
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           description: Question text
 *                         options:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               text:
 *                                 type: string
 *                                 description: Option text
 *                               isCorrect:
 *                                 type: boolean
 *                                 description: Whether this is the correct answer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the course was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the course was last updated
 *     CourseRating:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           description: Rating value (1-5)
 *           example: 5
 *         comment:
 *           type: string
 *           description: Optional review comment
 *           example: "Great course!"
 *     CourseEnrollment:
 *       type: object
 *       properties:
 *         learner:
 *           type: string
 *           description: Learner ID
 *           example: "60c72b1f9b1e8b001c8e4d3a"
 *         course:
 *           type: string
 *           description: Course ID
 *           example: "60c72b1f9b1e8b001c8e4d3a"
 *         progress:
 *           type: number
 *           description: Overall course progress percentage
 *           example: 75
 *         moduleProgress:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *                 example: "HTML Basics"
 *               completed:
 *                 type: boolean
 *                 example: true
 *               contentProgress:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     contentId:
 *                       type: string
 *                       example: "Introduction to HTML"
 *                     completed:
 *                       type: boolean
 *                       example: true
 *                     lastAccessedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *               quizAttempts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                       example: 85
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [0, 1, 2]
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T10:00:00Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T10:00:00Z"
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T10:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and enrollment endpoints
 */

/**
 * @swagger
 * /courses/latest:
 *   get:
 *     summary: Get latest courses
 *     tags: [Courses]
 *     description: Retrieves the 6 most recently published courses
 *     responses:
 *       200:
 *         description: Latest courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /courses/{id}/ratings:
 *   get:
 *     summary: Get course ratings
 *     tags: [Courses]
 *     description: Retrieves all ratings and reviews for a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60c72b1f9b1e8b001c8e4d3a"
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b1f9b1e8b001c8e4d3a"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       profilePicture:
 *                         type: string
 *                         example: "https://example.com/profile.jpg"
 *                   rating:
 *                     type: number
 *                     example: 5
 *                   comment:
 *                     type: string
 *                     example: "Great course!"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-20T10:00:00Z"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     description: Retrieves a specific course by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /courses/{id}/full:
 *   get:
 *     summary: Get course with full details
 *     tags: [Courses]
 *     description: Retrieves a course with all details including quiz answers (for facilitators)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course with full details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       403:
 *         description: Not authorized to view full course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to view full course details"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     description: Creates a new course (facilitator only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               description:
 *                 type: string
 *                 example: "Learn the basics of web development"
 *               status:
 *                 type: string
 *                 example: "published"
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "HTML Basics"
 *                     content:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Introduction to HTML"
 *                           type:
 *                             type: string
 *                             example: "video"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/video.mp4"
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error creating course"
 */

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     description: Updates an existing course (facilitator only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               description:
 *                 type: string
 *                 example: "Learn the basics of web development"
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "HTML Basics"
 *                     content:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Introduction to HTML"
 *                           type:
 *                             type: string
 *                             example: "video"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/video.mp4"
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       403:
 *         description: Not authorized to update this course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to update this course"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error updating course"
 */

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     description: Deletes a course (facilitator only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course deleted successfully"
 *       403:
 *         description: Not authorized to delete this course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to delete this course"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error deleting course"
 */

/**
 * @swagger
 * /courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     description: Enrolls the authenticated user in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseEnrollment'
 *       400:
 *         description: Already enrolled in this course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Already enrolled in this course"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error during enrollment"
 */

/**
 * @swagger
 * /courses/{courseId}/progress:
 *   put:
 *     summary: Update module progress
 *     tags: [Courses]
 *     description: Updates the progress for a specific module in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *             properties:
 *               moduleId:
 *                 type: string
 *                 example: "HTML Basics"
 *               contentId:
 *                 type: string
 *                 example: "Introduction to HTML"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseEnrollment'
 *       404:
 *         description: Enrollment or module not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Enrollment not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error updating progress"
 */

/**
 * @swagger
 * /courses/{courseId}/modules/{moduleId}/quiz:
 *   post:
 *     summary: Submit quiz attempt
 *     tags: [Courses]
 *     description: Submits answers for a module quiz
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of selected option indices
 *                 example: [0, 1, 2]
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   example: 85
 *                 passed:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Enrollment, course, or quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Enrollment not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error submitting quiz"
 */

/**
 * @swagger
 * /courses/{id}/rate:
 *   post:
 *     summary: Rate a course
 *     tags: [Courses]
 *     description: Submits a rating and review for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseRating'
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating submitted successfully"
 *                 rating:
 *                   type: number
 *                   example: 5
 *                 averageRating:
 *                   type: number
 *                   example: 4.5
 *       400:
 *         description: Invalid rating value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid rating value. Must be between 1 and 5."
 *       403:
 *         description: Not enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You must be enrolled in this course to rate it"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.get("/latest", async (req, res) => {
  try {
    let db = req.app.locals.db;

    // Fetch the last 6 published courses, sorted by createdAt descending
    let courses = await db
      .collection("courses")
      .find({ status: "published" })
      .sort({ "createdAt.is": -1 })
      .limit(6)
      .toArray();

    // Get facilitator names
    let facilitatorIds = [
      ...new Set(
        courses
          .map((course) =>
            course.facilitator ? new ObjectId(course.facilitator) : null
          )
          .filter((id) => id !== null)
      ),
    ];

    let facilitators =
      facilitatorIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: facilitatorIds } })
            .project({ _id: 1, name: 1 })
            .toArray()
        : [];

    let facilitatorMap = {};
    facilitators.forEach((f) => {
      facilitatorMap[f._id.toString()] = f.name;
    });

    // Sanitize courses
    let sanitizedCourses = courses.map((course) => {
      let facilitatorName =
        course.facilitator && facilitatorMap[course.facilitator]
          ? facilitatorMap[course.facilitator]
          : "Unknown";

      // Ensure enrolledStudents array exists
      if (!course.enrolledStudents) course.enrolledStudents = [];

      // Sanitize modules: remove quiz answers and content
      if (course.modules) {
        course.modules = course.modules.map((module) => {
          // Remove content
          let sanitizedModule = { ...module, content: [] };

          // Sanitize quiz
          if (sanitizedModule.quiz) sanitizedModule.quiz = "";

          return sanitizedModule;
        });
      }

      return {
        ...course,
        facilitatorName,
      };
    });

    res.json(sanitizedCourses);
  } catch (error) {
    console.error("Error fetching latest courses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all courses
router.get(
  "/",
  auth,
  roleAuth(["student", "facilitator"]),
  async (req, res) => {
    try {
      const { difficulty, status } = req.query;
      const query = {};

      if (difficulty) query.difficulty = difficulty;
      if (status) query.status = status;

      let db = req.app.locals.db;
      let courses = await db
        .collection("courses")
        .find(query)
        .populate("facilitator", "name email")
        .populate("enrollments", "learner progress")
        .sort({ createdAt: -1 })
        .toArray();

      // Get facilitator names
      let facilitatorIds = [
        ...new Set(
          courses
            .map((course) =>
              course.facilitator ? new ObjectId(course.facilitator) : null
            )
            .filter((id) => id !== null)
        ),
      ];

      let facilitators =
        facilitatorIds.length > 0
          ? await db
              .collection("users")
              .find({ _id: { $in: facilitatorIds } })
              .project({ _id: 1, name: 1 })
              .toArray()
          : [];

      let facilitatorMap = {};
      facilitators.forEach((f) => {
        facilitatorMap[f._id.toString()] = f.name;
      });

      let sanitizedCourses = courses.map((course) => {
        let facilitatorName =
          course.facilitator && facilitatorMap[course.facilitator]
            ? facilitatorMap[course.facilitator]
            : "Unknown";
        if (!course.enrolledStudents) course.enrolledStudents = [];
        // Remove quiz answers
        if (course.modules) {
          course.modules.forEach((module) => {
            if (module.quiz && module.quiz.questions) {
              module.quiz.questions.forEach((question) => {
                if (question.answer !== "" || question.answer !== null)
                  question.answer = "";
                if (question.options) {
                  question.options = question.options.map((option) => ({
                    text: option.text,
                  }));
                }
              });
            }
          });
        }

        return {
          ...course,
          facilitatorName,
        };
      });

      res.json(sanitizedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get course ratings
router.get("/:id/ratings", auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;

    // Get course with reviews
    let course = await db.collection("courses").findOne({
      courseId,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.reviews || course.reviews.length === 0) {
      return res.json([]);
    }

    // Get user details for each review
    let userIds = course.reviews.map((review) => review.user);
    let users = await db
      .collection("users")
      .find(
        { _id: { $in: userIds } },
        { projection: { _id: 1, name: 1, profilePicture: 1 } }
      )
      .toArray();

    // Create a map of user details
    let userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        _id: user._id.toString(),
        name: user.name,
        profilePicture: user.profilePicture,
      };
    });

    // Add user details to reviews
    let reviewsWithUserDetails = course.reviews.map((review) => ({
      _id: review._id || new ObjectId(),
      user: userMap[review.user.toString()] || { name: "Anonymous" },
      rating: review.rating,
      comment: review.comment,
      date: review.date,
    }));

    res.json(reviewsWithUserDetails);
  } catch (error) {
    console.error("Error fetching course ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get course by ID
router.get("/:id", async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;

    // let objectId = courseId;
    // try {
    //   objectId = courseId;
    // } catch (error) {
    //   return res.status(400).json({ message: "Invalid course ID format" });
    // }

    let course = await db.collection("courses").findOne({ courseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!course.enrolledStudents) course.enrolledStudents = [];

    let facilitatorInfo = { name: "Unknown", email: "" };
    if (course.facilitator) {
      try {
        let facilitator = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(course.facilitator) },
            { projection: { name: 1, email: 1 } }
          );
        if (facilitator) {
          facilitatorInfo = {
            name: facilitator.name,
            email: facilitator.email,
          };
        }
      } catch (error) {
        console.error("Error fetching facilitator:", error);
      }
    }

    if (course.modules) {
      course.modules.forEach((module) => {
        if (module.quiz && module.quiz.questions) {
          module.quiz.questions.forEach((question) => {
            if (question.options) {
              question.options = question.options.map((option) => ({
                text: option.text,
              }));
            }
          });
        }
      });
    }

    res.json({
      ...course,
      facilitator: facilitatorInfo,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get course with full details (including quiz answers)
router.get("/:id/full", auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;

    let course = await db.collection("courses").findOne({ courseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!course.enrolledStudents) course.enrolledStudents = [];

    let facilitatorInfo = { name: "Unknown", email: "" };
    if (course.facilitator) {
      try {
        let facilitator = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(course.facilitator) },
            { projection: { name: 1, email: 1 } }
          );
        if (facilitator) {
          facilitatorInfo = {
            name: facilitator.name,
            email: facilitator.email,
          };
        }
      } catch (error) {
        console.error("Error fetching facilitator:", error);
      }
    }

    if (
      req.user.role === "facilitator" &&
      course.facilitator !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view full course details" });
    }

    res.json({
      ...course,
      facilitator: facilitatorInfo,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new course
router.post("/", auth, roleAuth(["facilitator", "admin"]), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let dt = datemap();

    let courseData = {
      ...req.body,
      courseId: uuidv4(),
      enrolledStudents: [],
      facilitator: req.user.userId,
      enrolled: 0,
      rating: 0,
      students: [],
      reviews: [],
      key: `course-${dt.key}`,
      createdAt: dt,
      updatedAt: dt,
    };
    let pluged = await db
      .collection("courses")
      .findOne({ facilitator: req.user.userId, title: courseData.title });
    if (pluged)
      return res.status(500).json({
        message:
          "You Already have a Course with this title, please use a different title",
      });

    let result = await db.collection("courses").insertOne(courseData);

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.user.userId) },
        { $push: { createdCourses: result.insertedId.toString() } }
      );

    let insertedCourse = await db
      .collection("courses")
      .findOne({ _id: result.insertedId });

    res.status(201).json(insertedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error creating course" });
  }
});

// Update a course
router.put(
  "/:id",
  auth,
  roleAuth(["facilitator", "admin"]),
  async (req, res) => {
    try {
      let db = req.app.locals.db;
      let courseId = req.params.id;

      let course = await db.collection("courses").findOne({ courseId });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role === "facilitator" &&
        course.facilitator !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this course" });
      }

      let updateData = {
        ...req.body,
        updatedAt: datemap(),
      };
      delete updateData.facilitator;

      await db
        .collection("courses")
        .updateOne({ courseId }, { $set: updateData });
      clg(`${courseId} was updated successfully...`);
      let updatedCourse = await db.collection("courses").findOne({ courseId });

      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Server error updating course" });
    }
  }
);

// Delete a course
router.delete(
  "/:id",
  auth,
  roleAuth(["facilitator", "admin"]),
  async (req, res) => {
    try {
      let db = req.app.locals.db;
      let courseId = req.params.id;

      let course = await db.collection("courses").findOne(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role === "facilitator" &&
        course.facilitator !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this course" });
      }

      await db.collection("courses").deleteOne(courseId);

      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(course.facilitator) },
          { $pull: { createdCourses: courseId } }
        );

      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Server error deleting course" });
    }
  }
);

// Enroll in a course
router.post("/:id/enroll", auth, roleAuth(["student"]), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    let learnerId = req.user.userId;

    let course = await db.collection("courses").findOne({ courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let existingEnrollment = await db.collection("enrollments").findOne({
      learner: learnerId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    let enrollment = {
      learner: learnerId,
      course: courseId,
      progress: 0,
      moduleProgress: course.modules.map((module) => ({
        moduleId: module.title,
        completed: false,
        contentProgress: module.content.map((content) => ({
          contentId: content.title,
          completed: false,
        })),
        quizAttempts: [],
      })),
      enrolledAt: new Date(),
      completedAt: null,
      lastAccessed: new Date(),
    };

    let result = await db.collection("enrollments").insertOne(enrollment);

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(learnerId) },
        { $push: { enrolledCourses: courseId } }
      );

    await db
      .collection("courses")
      .updateOne({ courseId }, { $inc: { enrolled: 1 } });

    let insertedEnrollment = await db.collection("enrollments").findOne({
      _id: result.insertedId,
    });

    res.status(201).json(insertedEnrollment);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error during enrollment" });
  }
});

// Update module progress
router.put(
  "/:courseId/progress",
  auth,
  roleAuth(["learner"]),
  async (req, res) => {
    try {
      let db = req.app.locals.db;
      let { courseId } = req.params;
      let { moduleId, contentId, completed } = req.body;

      let enrollment = await db.collection("enrollments").findOne({
        learner: req.user.userId,
        course: courseId,
      });

      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      let moduleIndex = enrollment.moduleProgress.findIndex(
        (m) => m.moduleId === moduleId
      );

      if (moduleIndex === -1) {
        return res
          .status(404)
          .json({ message: "Module not found in enrollment" });
      }

      let update = {};

      if (contentId) {
        let contentIndex = enrollment.moduleProgress[
          moduleIndex
        ].contentProgress.findIndex((c) => c.contentId === contentId);

        if (contentIndex === -1) {
          update = {
            $push: {
              [`moduleProgress.${moduleIndex}.contentProgress`]: {
                contentId,
                completed,
                lastAccessedAt: new Date(),
              },
            },
          };
        } else {
          update = {
            $set: {
              [`moduleProgress.${moduleIndex}.contentProgress.${contentIndex}.completed`]:
                completed,
              [`moduleProgress.${moduleIndex}.contentProgress.${contentIndex}.lastAccessedAt`]:
                new Date(),
            },
          };
        }
      } else {
        update = {
          $set: {
            [`moduleProgress.${moduleIndex}.completed`]: completed,
          },
        };
      }

      update.$set = {
        ...update.$set,
        lastAccessed: new Date(),
      };

      await db
        .collection("enrollments")
        .updateOne({ _id: enrollment._id }, update);

      let updatedEnrollment = await db.collection("enrollments").findOne({
        _id: enrollment._id,
      });

      let totalModules = updatedEnrollment.moduleProgress.length;
      let completedModules = updatedEnrollment.moduleProgress.filter(
        (m) => m.completed
      ).length;
      let progress = Math.round((completedModules / totalModules) * 100);

      await db
        .collection("enrollments")
        .updateOne({ _id: enrollment._id }, { $set: { progress } });

      let finalEnrollment = await db.collection("enrollments").findOne({
        _id: enrollment._id,
      });

      res.json(finalEnrollment);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Server error updating progress" });
    }
  }
);

// Submit quiz attempt
router.post(
  "/:courseId/modules/:moduleId/quiz",
  auth,
  roleAuth(["learner"]),
  async (req, res) => {
    try {
      let db = req.app.locals.db;
      let { courseId, moduleId } = req.params;
      let { answers } = req.body;

      let enrollment = await db.collection("enrollments").findOne({
        learner: req.user.userId,
        course: courseId,
      });

      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      let course = await db.collection("courses").findOne({ courseId });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      let module = course.modules.find((m) => m.title === moduleId);
      if (!module || !module.quiz) {
        return res.status(404).json({ message: "Module or quiz not found" });
      }

      let score = 0;
      let quiz = module.quiz;

      answers.forEach((answer, index) => {
        if (index < quiz.questions.length) {
          let question = quiz.questions[index];
          let correctOptionIndex = question.options.findIndex(
            (option) => option.isCorrect
          );

          if (answer === correctOptionIndex) {
            score++;
          }
        }
      });

      let scorePercentage = Math.round((score / quiz.questions.length) * 100);

      let moduleIndex = enrollment.moduleProgress.findIndex(
        (m) => m.moduleId === moduleId
      );

      if (moduleIndex !== -1) {
        let quizAttempt = {
          score: scorePercentage,
          answers,
          completedAt: new Date(),
        };

        await db.collection("enrollments").updateOne(
          { _id: enrollment._id },
          {
            $push: {
              [`moduleProgress.${moduleIndex}.quizAttempts`]: quizAttempt,
            },
            $set: { lastAccessed: new Date() },
          }
        );

        if (scorePercentage >= 70) {
          await db
            .collection("enrollments")
            .updateOne(
              { _id: enrollment._id },
              { $set: { [`moduleProgress.${moduleIndex}.completed`]: true } }
            );
        }

        let updatedEnrollment = await db.collection("enrollments").findOne({
          _id: enrollment._id,
        });

        let totalModules = updatedEnrollment.moduleProgress.length;
        let completedModules = updatedEnrollment.moduleProgress.filter(
          (m) => m.completed
        ).length;
        let progress = Math.round((completedModules / totalModules) * 100);

        await db
          .collection("enrollments")
          .updateOne({ _id: enrollment._id }, { $set: { progress } });
      }

      res.json({
        score: scorePercentage,
        passed: scorePercentage >= 70,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Server error submitting quiz" });
    }
  }
);

// Rate a course
router.post("/:id/rate", auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    let { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Invalid rating value. Must be between 1 and 5." });
    }

    // Check if course exists
    let course = await db.collection("courses").findOne({
      courseId,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is enrolled in the course
    let enrollment = await db.collection("enrollments").findOne({
      courseId: courseId,
      studentId: req.user.userId,
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You must be enrolled in this course to rate it" });
    }

    // Get user details
    let user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user.userId) },
        { projection: { name: 1, profilePicture: 1 } }
      );

    // Check if user already rated this course
    let existingRatingIndex = course.reviews
      ? course.reviews.findIndex((r) => r.user.toString() === req.user.userId)
      : -1;

    let updatedReviews = course.reviews || [];

    let reviewData = {
      user: new ObjectId(req.user.userId),
      rating: rating,
      comment: comment || "",
      date: new Date(),
    };

    if (existingRatingIndex !== -1) {
      // Update existing rating
      updatedReviews[existingRatingIndex] = reviewData;
    } else {
      // Add new rating
      updatedReviews.push(reviewData);
    }

    // Calculate new average rating
    let totalRating = updatedReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    let averageRating = totalRating / updatedReviews.length;

    // Update course with new rating data
    await db.collection("courses").updateOne(
      { courseId },
      {
        $set: {
          reviews: updatedReviews,
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        },
      }
    );

    res.json({
      message: "Rating submitted successfully",
      rating: rating,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.error("Error rating course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
