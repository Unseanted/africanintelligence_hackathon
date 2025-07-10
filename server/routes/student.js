const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { ObjectId } = require("mongodb");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student profile, leaderboard, and stats endpoints
 */

/**
 * @swagger
 * /students/me:
 *   get:
 *     summary: Get authenticated student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

// GET /api/students/me - Get authenticated student's profile
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId })
      .populate("user", "name email role profilePicture")
      // .populate("enrollments", "-student")
      .lean();
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/me/stats:
 *   get:
 *     summary: Get stats for authenticated student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPoints:
 *                   type: number
 *                 rank:
 *                   type: number
 *                 completedChallenges:
 *                   type: number
 *                 activeChallenges:
 *                   type: number
 *                 currentStreak:
 *                   type: number
 *                 totalXp:
 *                   type: number
 *                 totalEnrolled:
 *                   type: number
 *                 certificatesEarned:
 *                   type: number
 *                 completedLessons:
 *                   type: number
 *                 totalLessons:
 *                   type: number
 *                 completedQuizzes:
 *                   type: number
 *                 totalQuizzes:
 *                   type: number
 *                 averageScore:
 *                   type: number
 *                 lastActive:
 *                   type: string
 *                   format: date-time
 *                 streakDays:
 *                   type: number
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

// GET /api/students/me/stats - Get stats for authenticated student
router.get("/me/stats", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId }).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Get enrollments
    const enrollments = await Enrollment.find({ student: student._id }).lean();
    const courseIds = enrollments.map((e) => e.course);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    // Completed/active challenges
    const completedChallenges = student.challenges?.completed?.length || 0;
    const activeChallenges = student.challenges?.inProgress?.length || 0;

    // Certificates earned (assume certificateIssued in enrollment)
    const certificatesEarned = enrollments.filter(
      (e) => e.certificateIssued
    ).length;

    // Lessons/quizzes
    let completedLessons = 0,
      totalLessons = 0,
      completedQuizzes = 0,
      totalQuizzes = 0,
      averageScore = 0,
      quizScores = [];
    enrollments.forEach((enrollment) => {
      (enrollment.moduleProgress || []).forEach((module) => {
        (module.contentProgress || []).forEach((content) => {
          totalLessons++;
          if (content.completed) completedLessons++;
        });
        (module.quizAttempts || []).forEach((quiz) => {
          totalQuizzes++;
          if (quiz.score !== undefined) {
            completedQuizzes++;
            quizScores.push(quiz.score);
          }
        });
      });
    });
    if (quizScores.length > 0) {
      averageScore = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
    }

    // Total enrolled courses
    const totalEnrolled = enrollments.length;

    // Total points/XP
    const totalPoints = student.xp?.allTime || 0;
    const totalXp = student.xp?.allTime || 0;

    // Current streak and streak days
    const currentStreak = student.streak || 0;
    const streakDays = student.streak || 0;

    // Last active date
    const lastActive = student.lastActive ? new Date(student.lastActive) : null;

    // Rank (overall)
    const allStudents = await Student.find({})
      .sort({ "xp.allTime": -1 })
      .select("_id")
      .lean();
    const rank =
      allStudents.findIndex(
        (s) => s._id.toString() === student._id.toString()
      ) + 1;

    res.json({
      totalPoints,
      rank,
      completedChallenges,
      activeChallenges,
      currentStreak,
      totalXp,
      totalEnrolled,
      certificatesEarned,
      completedLessons,
      totalLessons,
      completedQuizzes,
      totalQuizzes,
      averageScore,
      lastActive,
      streakDays,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Additional Student Endpoints (CRUD, course actions, friends, XP, badges, activity)
 */

// --- COURSE ACTIONS ---
/**
 * @swagger
 * /students/courses:
 *   get:
 *     summary: Get all courses the student is enrolled in
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
// Get all courses the student is enrolled in
router.get("/courses", auth, async (req, res) => {
  try {
    console.log("🔍 [Student Routes] GET /courses called");
    console.log("🔍 [Student Routes] User ID:", req.user.userId);

    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    console.log("🔍 [Student Routes] Student found:", !!student);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const enrollments = await Enrollment.find({
      student: student._id,
    }).populate("course");

    console.log("🔍 [Student Routes] Enrollments found:", enrollments.length);
    if (enrollments.length > 0) {
      console.log("🔍 [Student Routes] First enrollment sample:", {
        enrollmentId: enrollments[0]._id,
        courseId: enrollments[0].course?._id,
        courseTitle: enrollments[0].course?.title,
        progress: enrollments[0].progress,
      });
    }

    // Return enrollment data with course details and progress
    const enrollmentData = enrollments
      .map((enrollment) => {
        const course = enrollment.course;
        if (!course) {
          console.log(
            "🔍 [Student Routes] Warning: Course not found for enrollment:",
            enrollment._id
          );
          return null;
        }

        return {
          ...course.toObject(),
          enrollmentId: enrollment._id,
          progress: enrollment.progress || 0,
          moduleProgress: enrollment.moduleProgress || [],
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          certificateIssued: enrollment.certificateIssued,
          active: enrollment.active,
          lastAccessedAt: enrollment.enrolledAt, // Use enrolledAt as fallback
        };
      })
      .filter(Boolean); // Remove null entries

    console.log(
      "🔍 [Student Routes] Returning enrollment data:",
      enrollmentData.length
    );

    res.json(enrollmentData);
  } catch (error) {
    console.error("❌ [Student Routes] Error in /courses:", error);
    console.error("❌ [Student Routes] Error stack:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/courses/{courseId}:
 *   get:
 *     summary: Get details and progress for a specific course
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course details and progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 progress:
 *                   type: number
 *                 moduleProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Student not found or not enrolled in this course
 *       500:
 *         description: Server error
 */
// Get details and progress for a specific course
router.get("/courses/:courseId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: req.params.courseId,
    }).populate("course");
    if (!enrollment)
      return res.status(404).json({ message: "Not enrolled in this course" });
    res.json({
      ...enrollment.course.toObject(),
      progress: enrollment.progress,
      moduleProgress: enrollment.moduleProgress,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     responses:
 *       201:
 *         description: Enrollment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Already enrolled
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
// Enroll in a course
router.post("/courses/:courseId/enroll", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    let enrollment = await Enrollment.findOne({
      student: student._id,
      course: req.params.courseId,
    });
    if (enrollment)
      return res.status(400).json({ message: "Already enrolled" });
    enrollment = await Enrollment.create({
      student: student._id,
      course: req.params.courseId,
    });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/courses/{courseId}/progress:
 *   put:
 *     summary: Update progress in a course/module/content
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *               contentId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Enrollment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Student not found or not enrolled in this course
 *       500:
 *         description: Server error
 */
// Update progress in a course/module/content
router.put("/courses/:courseId/progress", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const { moduleId, contentId, completed } = req.body;
    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: req.params.courseId,
    });
    if (!enrollment)
      return res.status(404).json({ message: "Not enrolled in this course" });
    // Update progress logic here (simplified)
    enrollment.progress = enrollment.progress || 0;
    enrollment.progress += completed ? 1 : 0;
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/courses/{courseId}/watch-time:
 *   post:
 *     summary: Track video watch time
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Watch time tracked (not implemented)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
// Track video watch time
router.post("/courses/:courseId/watch-time", auth, async (req, res) => {
  try {
    // Implement logic to track watch time
    res.json({ message: "Watch time tracked (not implemented)" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /students/courses/{courseId}/status:
 *   get:
 *     summary: Check if enrolled in a course
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Enrollment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEnrolled:
 *                   type: boolean
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
// Check if enrolled in a course
router.get("/courses/:courseId/status", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: req.params.courseId,
    });
    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- PROFILE CRUD ---
// Update student profile
router.put("/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    Object.assign(student, req.body);
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// Delete student profile
router.delete("/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await Student.deleteOne({ user: userId });
    res.json({ message: "Student profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- FRIENDS MANAGEMENT ---
router.get("/me/friends", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId }).populate("friends");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student.friends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/me/friends/:friendId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.friends.includes(req.params.friendId)) {
      student.friends.push(req.params.friendId);
      await student.save();
    }
    res.json(student.friends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/me/friends/:friendId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    student.friends = student.friends.filter(
      (f) => f.toString() !== req.params.friendId
    );
    await student.save();
    res.json(student.friends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- XP, STREAK, BADGES, ACTIVITY ---
router.get("/me/xp", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student.xp);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me/streak", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ streak: student.streak });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me/badges", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId }).populate("badges");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student.badges);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me/activity", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ user: userId }).populate(
      "activity"
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student.activity);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
