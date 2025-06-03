const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const studentServices = require("../services/studentServices");

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseProgress:
 *       type: object
 *       properties:
 *         courseId:
 *           type: string
 *           description: The ID of the course
 *           example: "60c72b1f9b1e8b001c8e4d3a"
 *         userId:
 *           type: string
 *           description: The ID of the student
 *           example: "60c72b1f9b1e8b001c8e4d3a"
 *         progress:
 *           type: number
 *           description: Overall course progress percentage
 *           example: 75
 *         completedModules:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of completed module IDs
 *           example: ["module1", "module2"]
 *         quizScores:
 *           type: object
 *           description: Quiz scores for the course
 *           example: { "quiz1": 85, "quiz2": 90 }
 *     QuizSubmission:
 *       type: object
 *       required:
 *         - answers
 *       properties:
 *         answers:
 *           type: object
 *           description: Map of question IDs to selected answers
 *           example: { "q1": "a", "q2": "b" }
 *     QuizResult:
 *       type: object
 *       properties:
 *         score:
 *           type: number
 *           description: Quiz score as a percentage
 *           example: 85
 *         correctAnswers:
 *           type: number
 *           description: Number of correct answers
 *           example: 17
 *         totalQuestions:
 *           type: number
 *           description: Total number of questions
 *           example: 20
 *         feedback:
 *           type: object
 *           description: Feedback for each question
 *           example: { "q1": "Correct", "q2": "Incorrect" }
 */

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student-specific endpoints for course management and progress tracking
 */

/**
 * @swagger
 * /student/courses:
 *   get:
 *     summary: Get enrolled courses
 *     tags: [Student]
 *     description: Retrieves all courses that the authenticated student is enrolled in
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: string
 *                     example: "60c72b1f9b1e8b001c8e4d3a"
 *                   title:
 *                     type: string
 *                     example: "Introduction to Web Development"
 *                   description:
 *                     type: string
 *                     example: "Learn the basics of web development"
 *                   progress:
 *                     type: number
 *                     example: 75
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
 * /student/courses/{id}/progress:
 *   get:
 *     summary: Get course progress
 *     tags: [Student]
 *     description: Retrieves the progress details for a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Course progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgress'
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
 * /student/courses/{id}/progress:
 *   post:
 *     summary: Update course progress
 *     tags: [Student]
 *     description: Updates the progress for a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 description: New progress percentage
 *                 example: 80
 *     responses:
 *       200:
 *         description: Course progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgress'
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
 * /student/courses/{id}/complete-module/{moduleId}:
 *   post:
 *     summary: Mark module as complete
 *     tags: [Student]
 *     description: Marks a specific module as completed for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the module to mark as complete
 *     responses:
 *       200:
 *         description: Module marked as complete successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgress'
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
 * /student/courses/{id}/quiz/{quizId}:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Student]
 *     description: Submits answers for a course quiz and receives immediate feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizSubmission'
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResult'
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

// Get student's enrolled courses
router.get("/courses", auth, roleAuth(["student"]), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courses = await studentServices.getEnrolledCourses(db, userId);
    res.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get course progress
router.get(
  "/courses/:id/progress",
  auth,
  roleAuth(["student"]),
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const userId = req.user.userId;
      const courseId = req.params.id;
      const progress = await studentServices.getCourseProgress(
        db,
        userId,
        courseId
      );
      res.json(progress);
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update course progress
router.post(
  "/courses/:id/progress",
  auth,
  roleAuth(["student"]),
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const userId = req.user.userId;
      const courseId = req.params.id;
      const { progress } = req.body;
      const result = await studentServices.updateCourseProgress(
        db,
        userId,
        courseId,
        progress
      );
      res.json(result);
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Mark module as complete
router.post(
  "/courses/:id/complete-module/:moduleId",
  auth,
  roleAuth(["student"]),
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const userId = req.user.userId;
      const courseId = req.params.id;
      const moduleId = req.params.moduleId;
      const result = await studentServices.completeModule(
        db,
        userId,
        courseId,
        moduleId
      );
      res.json(result);
    } catch (error) {
      console.error("Error completing module:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Submit quiz answers
router.post(
  "/courses/:id/quiz/:quizId",
  auth,
  roleAuth(["student"]),
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const userId = req.user.userId;
      const { courseId, quizId } = req.params;
      const { answers } = req.body;
      const result = await studentServices.submitQuiz(
        db,
        userId,
        courseId,
        quizId,
        answers
      );
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
