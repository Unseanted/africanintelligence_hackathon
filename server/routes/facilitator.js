let express = require('express');
const moment = require('moment'); // For date manipulation
let router = express.Router();
let { ObjectId } = require('mongodb');
let auth = require('../middleware/auth');
let roleAuth = require('../middleware/roleAuth');
let { clg, ocn } = require('./basics');
const { updateMe } = require('../services/globalServices');

// Get facilitator's courses
router.get('/courses', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    
    // Fetch courses for the facilitator
    let courses = await db.collection('courses')
      .find({ 
        facilitator: req.user.userId,
        status: 'published'
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Ensure enrolledStudents array exists
    if (ocn(courses)) {
      courses = courses.map(crs => {
        if (!crs.enrolledStudents) crs.enrolledStudents = [];
        return crs;
      });
    }

    // If no courses found, return empty array
    if (!courses || courses.length === 0) {
      return res.json([]);
    }

    // Extract course IDs using course.key
    const courseIds = courses.map(course => course.key);

    // Fetch enrollments for these courses
    const enrollments = await db.collection('enrollments')
      .find({ courseId: { $in: courseIds } })
      .toArray();

    // If no enrollments found, attach empty enrollments array to each course and return
    if (!enrollments || enrollments.length === 0) {
      courses = courses.map(course => {
        course.enrollments = [];
        return course;
      });
      return res.json(courses);
    }

    // Extract unique student IDs from enrollments
    const studentIds = [...new Set(enrollments.map(enrollment => new ObjectId(enrollment.studentId)))];

    // Fetch student data (name and profilePicture) for these student IDs
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds } })
      .project({ name: 1, profilePicture: 1,role:1 })
      .toArray();
    // Create a map of studentId to student data for quick lookup
    const studentMap = students.reduce((map, student) => {
      map[student._id] = {
        studentName: student.name || 'Unknown',
        studentProfilePicture: student.profilePicture || null
      };
      return map;
    }, {});

    // Attach student data to each enrollment
    const updatedEnrollments = enrollments.map(enrollment => {
      const studentData = studentMap[enrollment.studentId] || { studentName: 'Unknown', studentProfilePicture: null };
      return {
        ...enrollment,
        studentName: studentData.studentName,
        studentProfilePicture: studentData.studentProfilePicture
      };
    });

    // Attach updated enrollments to each course
    courses = courses.map(course => {
      course.enrollments = updatedEnrollments.filter(enrollment => enrollment.courseId === course.key);
      return course;
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching facilitator courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get facilitator's draft courses
router.get('/courses/drafts', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    
    let courses = await db.collection('courses')
      .find({ 
        facilitator: req.user.userId,
        status: 'draft'
      })
      .sort({ createdAt: -1 })
      .toArray();
      if(ocn(courses))courses=courses.map(crs=>{
        if(!crs.enrolledStudents)crs.enrolledStudents=[];
        return crs;
      })
    res.json(courses);
  } catch (error) {
    console.error('Error fetching facilitator draft courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// draft course
router.post('/courses/draft/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    clg('draft course id -- ',courseId);
    
    // Check if course exists and belongs to this facilitator
    let course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: req.user.userId
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you do not have permission to delete it' });
    }
    
    await updateMe('courses',{key:courseId},{status:'draft'})
    
    res.json({ message: 'Course drafted successfully' });
  } catch (error) {
    console.error('Error drafting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/courses/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    clg('delete course id -- ',courseId);
    
    // Check if course exists and belongs to this facilitator
    let course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: req.user.userId
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you do not have permission to delete it' });
    }
    
    // Delete the course
    await db.collection('courses').deleteOne({ key: courseId });
    
    // Delete all enrollments for this course
    await db.collection('enrollments').deleteMany({ courseId: courseId });
    
    // Delete all forum posts related to this course
    await db.collection('forumPosts').deleteMany({ courseId:courseId });
    
    res.json({ message: 'Course and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students for a facilitator
router.get('/students', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    
    // Get all courses by this facilitator
    let courses = await db.collection('courses')
      .find({ facilitator: req.user.userId })
      .project({ title: 1, category: 1,key:1 })
      .toArray();
    if (!courses || courses.length === 0) {
      return res.json([]);
    }
    
    let courseIds = courses.map(course => course.key);
    let courseTitleMap = {};
    let categoryMap = {};
    
    courses.forEach(course => {
      courseTitleMap[course.key] = course.title;
      categoryMap[course.key] = course.category;
    });
    
    // Get all enrollments for these courses
    let enrollments = await db.collection('enrollments')
      .find({ courseId: { $in: courseIds } })
      .toArray();
    
    if (!enrollments || enrollments.length === 0) {
      return res.json([]);
    }
    // Get unique learner IDs
    let learnerIds = [...new Set(enrollments.map(e => e.studentId))];
    
    if (learnerIds.length === 0) {
      return res.json([]);
    }
    
    // Get student details
    let students = await db.collection('users')
      .find(
        { _id: { $in: learnerIds.map(id => new ObjectId(id)) } }
      )
      .toArray();
    
    // Process student data with course enrollments and progress
    let processedStudents = students.map(student => {
      // Get all enrollments for this student
      let studentEnrollments = enrollments.filter(
        e => e.learner === student._id.toString()
      );
      
      // Calculate average completion rate
      let totalProgress = studentEnrollments.reduce(
        (sum, enrollment) => sum + (enrollment.progress || 0), 0
      );
      let avgCompletion = studentEnrollments.length > 0 
        ? Math.round(totalProgress / studentEnrollments.length) 
        : 0;
      
      // Get last activity time
      let lastActiveEnrollment = studentEnrollments.sort(
        (a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0)
      )[0];
      
      // Generate last active text
      let lastActiveText = 'Not active yet';
      if (lastActiveEnrollment?.lastAccessed) {
        let lastActive = new Date(lastActiveEnrollment.lastAccessed);
        let now = new Date();
        let diffTime = Math.abs(now - lastActive);
        let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        if (diffDays > 0) {
          lastActiveText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          lastActiveText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          lastActiveText = 'Recently';
        }
      }
      
      // Course progress details
      let progress = studentEnrollments.map(enrollment => ({
        courseId: enrollment.course,
        course: courseTitleMap[enrollment.course] || 'Unknown Course',
        progress: enrollment.progress || 0,
        completed: enrollment.completedAt ? true : false
      }));
      
      // Get interests/tags based on enrolled courses
      let tags = [...new Set(
        studentEnrollments
          .map(enrollment => categoryMap[enrollment.course] || null)
          .filter(Boolean)
      )];
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        profilePicture: student.profilePicture,
        enrolledCourses: studentEnrollments.length,
        completionRate: avgCompletion,
        lastActive: lastActiveText,
        tags,
        progress
      };
    });
    
    res.json(processedStudents);
  } catch (error) {
    console.error('Error fetching facilitator students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course students
router.get('/courses/:id/students', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    // Check if facilitator owns this course
    let course = await db.collection('courses').findOne({ 
      _id: new ObjectId(courseId), 
      facilitator: req.user.userId 
    });
    
    if (!course) {
      return res.status(403).json({ 
        message: 'Not authorized to access this course or course not found' 
      });
    }
    
    // Get enrollments with student details
    let enrollments = await db.collection('enrollments')
      .find({ course: courseId })
      .toArray();
    
    // Get student details
    let studentIds = enrollments.map(e => e.learner);
    
    let students = await db.collection('users')
      .find(
        { _id: { $in: studentIds.map(id => new ObjectId(id)) } },
        { projection: { name: 1, email: 1, profilePicture: 1 } }
      )
      .toArray();
    
    // Create a map of student details
    let studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = {
        name: s.name,
        email: s.email,
        profilePicture: s.profilePicture
      };
    });
    
    // Combine enrollment data with student details
    let studentsWithProgress = enrollments.map(enrollment => ({
      ...enrollment,
      studentInfo: studentMap[enrollment.learner] || { name: 'Unknown', email: '', profilePicture: '' }
    }));
    
    res.json(studentsWithProgress);
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course analytics
router.get('/courses/:id/analytics', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    // Check if facilitator owns this course
    let course = await db.collection('courses').findOne({ 
      _id: new ObjectId(courseId), 
      facilitator: req.user.userId 
    });
    
    if (!course) {
      return res.status(403).json({ 
        message: 'Not authorized to access this course or course not found' 
      });
    }
    
    // Get enrollments for this course
    let enrollments = await db.collection('enrollments')
      .find({ course: courseId })
      .toArray();
    
    // Calculate module completion rates
    let moduleCompletionRates = {};
    let moduleAttempts = {};
    
    course.modules.forEach(module => {
      moduleCompletionRates[module._id.toString()] = 0;
      moduleAttempts[module._id.toString()] = 0;
    });
    
    enrollments.forEach(enrollment => {
      enrollment.moduleProgress.forEach(progress => {
        if (progress.completed) {
          moduleCompletionRates[progress.moduleId]++;
        }
        
        if (progress.quizAttempts && progress.quizAttempts.length > 0) {
          moduleAttempts[progress.moduleId] += progress.quizAttempts.length;
        }
      });
    });
    
    // Convert to percentages
    for (let moduleId in moduleCompletionRates) {
      moduleCompletionRates[moduleId] = enrollments.length > 0 
        ? Math.round((moduleCompletionRates[moduleId] / enrollments.length) * 100)
        : 0;
    }
    
    // Get average course progress
    let totalProgress = enrollments.reduce(
      (sum, enrollment) => sum + (enrollment.progress || 0), 
      0
    );
    
    let averageProgress = enrollments.length > 0 
      ? Math.round(totalProgress / enrollments.length) 
      : 0;
    
    // Response with analytics
    res.json({
      totalEnrollments: enrollments.length,
      averageProgress,
      moduleCompletionRates,
      moduleAttempts
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facilitator dashboard stats
router.get('/dashboard', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    const moment = require('moment');

    let courses = await db.collection('courses')
      .find({ facilitator: req.user.userId })
      .toArray();

    if (!courses || courses.length === 0) {
      return res.json({
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalModules: 0,
        activeModules: 0,
        totalEnrollments: 0,
        studentGrowth: 0,
        activeStudents: 0,
        averageCompletionRate: 0,
        completionRateGrowth: 0,
        courseGrowth: 0,
        engagementScore: 0,
        engagementTrend: [0, 0, 0, 0],
        activityHeatmap: [0, 0, 0, 0, 0, 0, 0],
        enrollmentTrend: [0, 0, 0, 0],
        recentActivities: []
      });
    }

    let totalModules = 0;
    courses.forEach(course => {
      totalModules += (course.modules ? course.modules.length : 0);
    });

    let courseKeys = courses.map(course => course.key);

    let enrollments = await db.collection('enrollments')
      .find({ 
        courseId: { $in: courseKeys },
        active: { $ne: false }
      })
      .toArray();

    let studentIds = [...new Set(enrollments.map(e => e.studentId))];
    let totalEnrollments = studentIds.length;

    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const sixtyDaysAgo = moment().subtract(60, 'days').toDate();

    let recentEnrollments = await db.collection('enrollments')
      .find({
        courseId: { $in: courseKeys },
        enrolledAt: { $gte: thirtyDaysAgo }
      })
      .toArray();
    let recentStudentIds = [...new Set(recentEnrollments.map(e => e.studentId))];
    let previousEnrollments = await db.collection('enrollments')
      .find({
        courseId: { $in: courseKeys },
        enrolledAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      })
      .toArray();
    let previousStudentIds = [...new Set(previousEnrollments.map(e => e.studentId))];

    let studentGrowth = previousStudentIds.length > 0
      ? ((recentStudentIds.length - previousStudentIds.length) / previousStudentIds.length) * 100
      : recentStudentIds.length > 0 ? 100 : 0;

    // Calculate engagement score (simplified: based on forum posts, quiz completions, and enrollments)
    let recentForumPosts = await db.collection('forumPosts')
      .find({
        course: { $in: courseKeys },
        createdAt: { $gte: thirtyDaysAgo }
      })
      .toArray();
    let recentQuizzes = await db.collection('quizzes') // Assuming a quizzes collection
      .find({
        courseId: { $in: courseKeys },
        completedAt: { $gte: thirtyDaysAgo }
      })
      .toArray();
    let engagementScore = (recentEnrollments.length * 1 + recentForumPosts.length * 2 + recentQuizzes.length * 3) / (courses.length || 1);

    // Calculate engagement trend (last 4 weeks)
    let engagementTrend = [];
    for (let i = 3; i >= 0; i--) {
      let weekStart = moment().subtract(i, 'weeks').startOf('week').toDate();
      let weekEnd = moment().subtract(i, 'weeks').endOf('week').toDate();
      let weekEnrollments = await db.collection('enrollments')
        .find({
          courseId: { $in: courseKeys },
          enrolledAt: { $gte: weekStart, $lte: weekEnd }
        })
        .toArray();
      let weekForumPosts = await db.collection('forumPosts')
        .find({
          course: { $in: courseKeys },
          createdAt: { $gte: weekStart, $lte: weekEnd }
        })
        .toArray();
      let weekQuizzes = await db.collection('quizzes')
        .find({
          courseId: { $in: courseKeys },
          completedAt: { $gte: weekStart, $lte: weekEnd }
        })
        .toArray();
      let weekScore = (weekEnrollments.length * 1 + weekForumPosts.length * 2 + weekQuizzes.length * 3) / (courses.length || 1);
      engagementTrend.push(Math.round(weekScore));
    }

    // Calculate activity heatmap (daily activity over the last week)
    let activityHeatmap = [];
    for (let i = 6; i >= 0; i--) {
      let dayStart = moment().subtract(i, 'days').startOf('day').toDate();
      let dayEnd = moment().subtract(i, 'days').endOf('day').toDate();
      let dayActivity = await db.collection('enrollments')
        .find({
          courseId: { $in: courseKeys },
          enrolledAt: { $gte: dayStart, $lte: dayEnd }
        })
        .toArray();
      let dayForumPosts = await db.collection('forumPosts')
        .find({
          course: { $in: courseKeys },
          createdAt: { $gte: dayStart, $lte: dayEnd }
        })
        .toArray();
      let dayQuizzes = await db.collection('quizzes')
        .find({
          courseId: { $in: courseKeys },
          completedAt: { $gte: dayStart, $lte: dayEnd }
        })
        .toArray();
      activityHeatmap.push(dayActivity.length + dayForumPosts.length + dayQuizzes.length);
    }

    let totalCompletionRate = 0;
    let courseCompletionRates = [];
    for (let course of courses) {
      let courseEnrollments = enrollments.filter(e => e.courseId === course.key);
      let enrolledCount = courseEnrollments.length;

      let completedCount = courseEnrollments.filter(e => e.progress >= 100).length;
      let completionRate = enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0;
      courseCompletionRates.push(completionRate);

      // Simulate AI-predicted success rate (e.g., based on completion rate, engagement, and historical data)
      let aiPredictedSuccess = Math.min(100, completionRate * 1.2 + (recentForumPosts.filter(p => p.course === course.key).length * 2));
      
      await db.collection('courses').updateOne(
        { key: course.key },
        { 
          $set: { 
            enrolled: enrolledCount,
            completionRate: completionRate.toFixed(2),
            aiPredictedSuccess: aiPredictedSuccess.toFixed(2)
          }
        }
      );
    }

    let averageCompletionRate = courseCompletionRates.length > 0
      ? courseCompletionRates.reduce((a, b) => a + b, 0) / courseCompletionRates.length
      : 0;

    let previousEnrollmentsCompleted = previousEnrollments.filter(e => e.progress >= 100).length;
    let previousCompletionRate = previousEnrollments.length > 0
      ? (previousEnrollmentsCompleted / previousEnrollments.length) * 100
      : 0;
    let recentEnrollmentsCompleted = recentEnrollments.filter(e => e.progress >= 100).length;
    let recentCompletionRate = recentEnrollments.length > 0
      ? (recentEnrollmentsCompleted / recentEnrollments.length) * 100
      : 0;
    let completionRateGrowth = previousCompletionRate > 0
      ? ((recentCompletionRate - previousCompletionRate) / previousCompletionRate) * 100
      : recentCompletionRate > 0 ? 100 : 0;

    let recentCourses = courses.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    let previousCourses = courses.filter(c => new Date(c.createdAt) >= sixtyDaysAgo && new Date(c.createdAt) < thirtyDaysAgo);
    let courseGrowth = previousCourses.length > 0
      ? ((recentCourses.length - previousCourses.length) / previousCourses.length) * 100
      : recentCourses.length > 0 ? 100 : 0;

    let activeModuleIds = [...new Set(recentForumPosts.map(p => p.moduleId))];
    let activeModules = activeModuleIds.length;

    let enrollmentTrend = [];
    for (let i = 3; i >= 0; i--) {
      let weekStart = moment().subtract(i, 'weeks').startOf('week').toDate();
      let weekEnd = moment().subtract(i, 'weeks').endOf('week').toDate();
      let weekEnrollments = await db.collection('enrollments')
        .find({
          courseId: { $in: courseKeys },
          enrolledAt: { $gte: weekStart, $lte: weekEnd }
        })
        .toArray();
      let weekStudentIds = [...new Set(weekEnrollments.map(e => e.studentId))];
      enrollmentTrend.push(weekStudentIds.length);
    }

    let recentEnrollmentsActivity = await db.collection('enrollments')
      .find({ courseId: { $in: courseKeys } })
      .sort({ enrolledAt: -1 })
      .limit(5)
      .toArray();

    let recentForumPostsActivity = await db.collection('forumPosts')
      .find({ course: { $in: courseKeys } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    let recentQuizzesActivity = await db.collection('quizzes')
      .find({ courseId: { $in: courseKeys } })
      .sort({ completedAt: -1 })
      .limit(5)
      .toArray();

    // Simulate AI risk detection (e.g., students with low activity)
    let atRiskStudents = await db.collection('enrollments')
      .find({
        courseId: { $in: courseKeys },
        progress: { $lt: 20 },
        lastActivity: { $lt: thirtyDaysAgo }
      })
      .limit(2)
      .toArray();

    let activities = [
      ...recentEnrollmentsActivity.map(enrollment => ({
        type: 'enrollment',
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        date: enrollment.enrolledAt
      })),
      ...recentForumPostsActivity.map(post => ({
        type: 'forum',
        studentId: post.author.toString(),
        courseId: post.course,
        date: post.createdAt,
        moduleId: post.moduleId
      })),
      ...recentQuizzesActivity.map(quiz => ({
        type: 'quiz',
        studentId: quiz.studentId,
        courseId: quiz.courseId,
        date: quiz.completedAt
      })),
      ...atRiskStudents.map(enrollment => ({
        type: 'risk',
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        date: new Date(),
        riskLevel: 'High'
      }))
    ];

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    let studentIdsInActivities = [...new Set(activities.map(a => a.studentId))];
    let students = await db.collection('users')
      .find(
        { _id: { $in: studentIdsInActivities.map(id => new ObjectId(id)) } },
        { projection: { _id: 1, name: 1, profilePicture: 1 } }
      )
      .toArray();

    let studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = { name: s.name, profilePicture: s.profilePicture };
    });

    let courseKeysInActivities = [...new Set(activities.map(a => a.courseId))];
    let activeCourses = await db.collection('courses')
      .find(
        { key: { $in: courseKeysInActivities } },
        { projection: { key: 1, title: 1 } }
      )
      .toArray();

    let courseMap = {};
    activeCourses.forEach(c => {
      courseMap[c.key] = c.title;
    });

    let formattedActivities = activities.slice(0, 10).map(activity => {
      let timeDiff = moment().diff(moment(activity.date), 'hours');
      let timeStr = timeDiff < 1 ? 'just now' : timeDiff < 24 ? `${timeDiff} hours ago` : moment(activity.date).format('MMM D, YYYY');
      let description;
      switch (activity.type) {
        case 'enrollment':
          description = `${studentMap[activity.studentId]?.name || 'Unknown Student'} enrolled in ${courseMap[activity.courseId] || 'Unknown Course'}`;
          break;
        case 'forum':
          description = `${studentMap[activity.studentId]?.name || 'Unknown Student'} posted in ${courseMap[activity.courseId] || 'Unknown Course'}`;
          break;
        case 'quiz':
          description = `${studentMap[activity.studentId]?.name || 'Unknown Student'} completed a quiz in ${courseMap[activity.courseId] || 'Unknown Course'}`;
          break;
        case 'risk':
          description = `AI Alert: ${studentMap[activity.studentId]?.name || 'Unknown Student'} is at risk in ${courseMap[activity.courseId] || 'Unknown Course'}`;
          break;
        default:
          description = 'Unknown activity';
      }

      return {
        description,
        time: timeStr,
        user: {
          name: studentMap[activity.studentId]?.name || 'Unknown Student',
          profilePicture: studentMap[activity.studentId]?.profilePicture || ''
        },
        riskLevel: activity.riskLevel
      };
    });

    res.json({
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      totalModules,
      activeModules,
      totalEnrollments,
      studentGrowth: studentGrowth.toFixed(2),
      activeStudents: totalEnrollments,
      averageCompletionRate: averageCompletionRate.toFixed(2),
      completionRateGrowth: completionRateGrowth.toFixed(2),
      courseGrowth: courseGrowth.toFixed(2),
      engagementScore: Math.round(engagementScore),
      engagementTrend,
      activityHeatmap,
      enrollmentTrend,
      recentActivities: formattedActivities
    });
  } catch (error) {
    console.error('Error fetching facilitator dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
