
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const facilitatorServices = require('../services/facilitatorServices');

// Get facilitator dashboard stats
router.get('/dashboard', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const dashboard = await facilitatorServices.getDashboardStats(db, userId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching facilitator dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all facilitator's courses
router.get('/courses', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const courses = await facilitatorServices.getAllCourses(db, userId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching facilitator courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get draft courses
router.get('/courses/drafts', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const draftCourses = await facilitatorServices.getDraftCourses(db, userId);
    res.json(draftCourses);
  } catch (error) {
    console.error('Error fetching draft courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move course to draft status
router.post('/courses/draft/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.id;
    const userId = req.user.userId;
    const result = await facilitatorServices.moveToDraft(db, courseId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error moving course to draft:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course
router.delete('/courses/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.id;
    const userId = req.user.userId;
    const result = await facilitatorServices.deleteCourse(db, courseId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students enrolled in facilitator's courses
router.get('/students', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const students = await facilitatorServices.getEnrolledStudents(db, userId);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students for a specific course
router.get('/courses/:id/students', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.id;
    const userId = req.user.userId;
    const students = await facilitatorServices.getCourseStudents(db, courseId, userId);
    res.json(students);
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics for a specific course
router.get('/courses/:id/analytics', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.id;
    const userId = req.user.userId;
    const analytics = await facilitatorServices.getCourseAnalytics(db, courseId, userId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
