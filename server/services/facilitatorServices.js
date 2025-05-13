
const { ObjectId } = require('mongodb');

// Get facilitator dashboard stats
const getDashboardStats = async (db, userId) => {
  try {
    // Get courses created by this facilitator
    const courses = await db.collection('courses')
      .find({ facilitator: userId })
      .toArray();

    // Extract course IDs
    const courseIds = courses.map(course => course.key);

    // Get enrollment count for these courses
    const enrollmentCount = await db.collection('enrollments')
      .countDocuments({ courseId: { $in: courseIds } });

    // Get unique students enrolled in these courses
    const enrollments = await db.collection('enrollments')
      .find({ courseId: { $in: courseIds } })
      .toArray();
    
    const uniqueStudentIds = [...new Set(enrollments.map(e => e.studentId))];
    const studentCount = uniqueStudentIds.length;

    // Get published and draft course counts
    const publishedCount = courses.filter(c => c.status === 'published').length;
    const draftCount = courses.filter(c => c.status === 'draft').length;

    // Get recent enrollments
    const recentEnrollments = await db.collection('enrollments')
      .find({ courseId: { $in: courseIds } })
      .sort({ enrolledAt: -1 })
      .limit(5)
      .toArray();

    // Get student information for recent enrollments
    const studentIds = recentEnrollments.map(e => new ObjectId(e.studentId));
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds } })
      .project({ name: 1, email: 1, profilePicture: 1 })
      .toArray();

    const studentMap = {};
    students.forEach(student => {
      studentMap[student._id.toString()] = student;
    });

    // Enrich enrollments with course and student info
    const enrichedEnrollments = await Promise.all(recentEnrollments.map(async enrollment => {
      const course = courses.find(c => c.key === enrollment.courseId);
      const student = studentMap[enrollment.studentId];

      return {
        ...enrollment,
        courseName: course ? course.title : 'Unknown Course',
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : '',
        studentPicture: student ? student.profilePicture : null
      };
    }));

    return {
      totalCourses: courses.length,
      publishedCourses: publishedCount,
      draftCourses: draftCount,
      totalEnrollments: enrollmentCount,
      totalStudents: studentCount,
      recentEnrollments: enrichedEnrollments
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
};

// Get all courses created by facilitator
const getAllCourses = async (db, userId) => {
  try {
    const courses = await db.collection('courses')
      .find({ facilitator: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // For each course, get enrollment count
    const coursesWithEnrollmentCount = await Promise.all(courses.map(async course => {
      const enrollmentCount = await db.collection('enrollments')
        .countDocuments({ courseId: course.key });
      
      return {
        ...course,
        enrollmentCount
      };
    }));

    return coursesWithEnrollmentCount;
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    throw error;
  }
};

// Get draft courses
const getDraftCourses = async (db, userId) => {
  try {
    const draftCourses = await db.collection('courses')
      .find({ facilitator: userId, status: 'draft' })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return draftCourses;
  } catch (error) {
    console.error('Error in getDraftCourses:', error);
    throw error;
  }
};

// Move course to draft status
const moveToDraft = async (db, courseId, userId) => {
  try {
    // Verify ownership of the course
    const course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: userId
    });

    if (!course) {
      throw new Error('Course not found or you do not have permission');
    }

    await db.collection('courses').updateOne(
      { key: courseId, facilitator: userId },
      { $set: { status: 'draft', updatedAt: new Date() } }
    );

    return { message: 'Course moved to draft status successfully' };
  } catch (error) {
    console.error('Error in moveToDraft:', error);
    throw error;
  }
};

// Delete a course
const deleteCourse = async (db, courseId, userId) => {
  try {
    // Verify ownership of the course
    const course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: userId
    });

    if (!course) {
      throw new Error('Course not found or you do not have permission');
    }

    // Delete course
    await db.collection('courses').deleteOne({ key: courseId });

    // Delete related enrollments
    await db.collection('enrollments').deleteMany({ courseId: courseId });

    return { message: 'Course deleted successfully' };
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    throw error;
  }
};

// Get all students enrolled in facilitator's courses
const getEnrolledStudents = async (db, userId) => {
  try {
    // Get all course IDs created by this facilitator
    const courses = await db.collection('courses')
      .find({ facilitator: userId })
      .project({ key: 1 })
      .toArray();
    
    const courseIds = courses.map(course => course.key);
    
    if (courseIds.length === 0) {
      return [];
    }
    
    // Get all enrollments for these courses
    const enrollments = await db.collection('enrollments')
      .find({ courseId: { $in: courseIds } })
      .toArray();
    
    // Extract unique student IDs
    const studentIds = [...new Set(enrollments.map(e => e.studentId))];
    
    if (studentIds.length === 0) {
      return [];
    }
    
    // Get student information
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds.map(id => new ObjectId(id)) } })
      .project({ password: 0 })
      .toArray();
    
    // For each student, find their enrolled courses
    const studentsWithCourses = await Promise.all(students.map(async student => {
      const studentEnrollments = enrollments.filter(e => e.studentId === student._id.toString());
      
      const enrolledCourses = await Promise.all(studentEnrollments.map(async enrollment => {
        const course = await db.collection('courses').findOne({ key: enrollment.courseId });
        return {
          courseId: enrollment.courseId,
          title: course ? course.title : 'Unknown Course',
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress || 0
        };
      }));
      
      return {
        ...student,
        enrolledCourses
      };
    }));
    
    return studentsWithCourses;
  } catch (error) {
    console.error('Error in getEnrolledStudents:', error);
    throw error;
  }
};

// Get students for a specific course
const getCourseStudents = async (db, courseId, userId) => {
  try {
    // Verify ownership of the course
    const course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: userId
    });

    if (!course) {
      throw new Error('Course not found or you do not have permission');
    }
    
    // Get enrollments for this course
    const enrollments = await db.collection('enrollments')
      .find({ courseId: courseId })
      .toArray();
    
    if (enrollments.length === 0) {
      return [];
    }
    
    // Get student information
    const studentIds = enrollments.map(e => new ObjectId(e.studentId));
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds } })
      .project({ password: 0 })
      .toArray();
    
    // Combine student info with enrollment data
    const studentsWithProgress = students.map(student => {
      const enrollment = enrollments.find(e => e.studentId === student._id.toString());
      return {
        ...student,
        enrollmentData: {
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress || 0,
          lastAccessedAt: enrollment.lastAccessedAt
        }
      };
    });
    
    return studentsWithProgress;
  } catch (error) {
    console.error('Error in getCourseStudents:', error);
    throw error;
  }
};

// Get analytics for a specific course
const getCourseAnalytics = async (db, courseId, userId) => {
  try {
    // Verify ownership of the course
    const course = await db.collection('courses').findOne({
      key: courseId,
      facilitator: userId
    });

    if (!course) {
      throw new Error('Course not found or you do not have permission');
    }
    
    // Get enrollments for this course
    const enrollments = await db.collection('enrollments')
      .find({ courseId: courseId })
      .toArray();
    
    // Calculate completion rate
    const completedCount = enrollments.filter(e => (e.progress || 0) === 100).length;
    const completionRate = enrollments.length > 0 
      ? (completedCount / enrollments.length) * 100 
      : 0;
    
    // Calculate average progress
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const averageProgress = enrollments.length > 0 
      ? totalProgress / enrollments.length 
      : 0;
    
    // Calculate module completion rates
    const moduleCompletionMap = {};
    
    enrollments.forEach(enrollment => {
      if (enrollment.moduleProgress) {
        Object.entries(enrollment.moduleProgress).forEach(([moduleId, completed]) => {
          if (!moduleCompletionMap[moduleId]) {
            moduleCompletionMap[moduleId] = { completed: 0, total: 0 };
          }
          moduleCompletionMap[moduleId].total += 1;
          if (completed) {
            moduleCompletionMap[moduleId].completed += 1;
          }
        });
      }
    });
    
    const moduleCompletionRates = Object.entries(moduleCompletionMap).map(([moduleId, data]) => ({
      moduleId,
      completionRate: (data.completed / data.total) * 100
    }));
    
    // Find most recent enrollments
    const recentEnrollments = enrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 5);
    
    // Get student information for recent enrollments
    const studentIds = recentEnrollments.map(e => new ObjectId(e.studentId));
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds } })
      .project({ name: 1, email: 1, profilePicture: 1 })
      .toArray();
    
    const studentMap = {};
    students.forEach(student => {
      studentMap[student._id.toString()] = student;
    });
    
    const enrichedRecentEnrollments = recentEnrollments.map(enrollment => ({
      ...enrollment,
      student: studentMap[enrollment.studentId] || { name: 'Unknown Student' }
    }));
    
    return {
      totalEnrollments: enrollments.length,
      completionRate,
      averageProgress,
      moduleCompletionRates,
      recentEnrollments: enrichedRecentEnrollments,
      courseTitle: course.title
    };
  } catch (error) {
    console.error('Error in getCourseAnalytics:', error);
    throw error;
  }
};

module.exports = {
  getDashboardStats,
  getAllCourses,
  getDraftCourses,
  moveToDraft,
  deleteCourse,
  getEnrolledStudents,
  getCourseStudents,
  getCourseAnalytics
};
