
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const studentServices = require('../services/studentServices');

// Get student's enrolled courses
router.get('/courses', auth, roleAuth(['student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courses = await studentServices.getEnrolledCourses(db, userId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course progress
router.get('/courses/:id/progress', auth, roleAuth(['student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courseId = req.params.id;
    const progress = await studentServices.getCourseProgress(db, userId, courseId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course progress
router.post('/courses/:id/progress', auth, roleAuth(['student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courseId = req.params.id;
    const { progress } = req.body;
    const result = await studentServices.updateCourseProgress(db, userId, courseId, progress);
    res.json(result);
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark module as complete
router.post('/courses/:id/complete-module/:moduleId', auth, roleAuth(['student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courseId = req.params.id;
    const moduleId = req.params.moduleId;
    const result = await studentServices.completeModule(db, userId, courseId, moduleId);
    res.json(result);
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answers
router.post('/courses/:id/quiz/:quizId', auth, roleAuth(['student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const { courseId, quizId } = req.params;
    const { answers } = req.body;
    const result = await studentServices.submitQuiz(db, userId, courseId, quizId, answers);
    res.json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
