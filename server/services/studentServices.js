
const { ObjectId } = require('mongodb');

// Get student's enrolled courses
const getEnrolledCourses = async (db, userId) => {
  try {
    // Find the user to get the enrolled courses
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { enrolledCourses: 1 } }
    );
    
    if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
      return [];
    }
    
    // Get all enrolled courses
    const courses = await db.collection('courses')
      .find({ key: { $in: user.enrolledCourses }, status: 'published' })
      .toArray();
    
    // Get enrollment data for progress information
    const enrollments = await db.collection('enrollments')
      .find({ 
        studentId: userId,
        courseId: { $in: user.enrolledCourses }
      })
      .toArray();
    
    const enrollmentMap = {};
    enrollments.forEach(enrollment => {
      enrollmentMap[enrollment.courseId] = enrollment;
    });
    
    // Get facilitator information
    const facilitatorIds = [...new Set(courses
      .map(course => course.facilitator)
      .filter(id => id))];
    
    const facilitators = await db.collection('users')
      .find({ _id: { $in: facilitatorIds.map(id => new ObjectId(id)) } })
      .project({ name: 1, email: 1, profilePicture: 1 })
      .toArray();
    
    const facilitatorMap = {};
    facilitators.forEach(facilitator => {
      facilitatorMap[facilitator._id.toString()] = facilitator;
    });
    
    // Enrich the courses with enrollment and facilitator data
    const enrichedCourses = courses.map(course => {
      const enrollment = enrollmentMap[course.key] || { progress: 0 };
      const facilitator = facilitatorMap[course.facilitator] || { name: 'Unknown Facilitator' };
      
      return {
        ...course,
        progress: enrollment.progress || 0,
        lastAccessedAt: enrollment.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt,
        facilitatorName: facilitator.name,
        facilitatorEmail: facilitator.email,
        facilitatorPicture: facilitator.profilePicture
      };
    });
    
    return enrichedCourses;
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    throw error;
  }
};

// Get course progress
const getCourseProgress = async (db, userId, courseId) => {
  try {
    // Ensure the user is enrolled in the course
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), enrolledCourses: courseId }
    );
    
    if (!user) {
      throw new Error('Not enrolled in this course');
    }
    
    // Get the enrollment document
    const enrollment = await db.collection('enrollments').findOne({
      studentId: userId,
      courseId: courseId
    });
    
    if (!enrollment) {
      throw new Error('Enrollment record not found');
    }
    
    // Get the course
    const course = await db.collection('courses').findOne({ key: courseId });
    if (!course) {
      throw new Error('Course not found');
    }
    
    return {
      courseId,
      progress: enrollment.progress || 0,
      moduleProgress: enrollment.moduleProgress || {},
      quizResults: enrollment.quizResults || [],
      lastAccessedAt: enrollment.lastAccessedAt,
      courseTitle: course.title,
      totalModules: course.modules ? course.modules.length : 0
    };
  } catch (error) {
    console.error('Error in getCourseProgress:', error);
    throw error;
  }
};

// Update course progress
const updateCourseProgress = async (db, userId, courseId, progress) => {
  try {
    // Ensure the user is enrolled in the course
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), enrolledCourses: courseId }
    );
    
    if (!user) {
      throw new Error('Not enrolled in this course');
    }
    
    // Validate progress
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }
    
    // Update the enrollment
    const now = new Date();
    await db.collection('enrollments').updateOne(
      { studentId: userId, courseId: courseId },
      { 
        $set: { 
          progress: progress,
          lastAccessedAt: now,
          updatedAt: now
        } 
      },
      { upsert: true }
    );
    
    return { message: 'Progress updated successfully', progress };
  } catch (error) {
    console.error('Error in updateCourseProgress:', error);
    throw error;
  }
};

// Mark module as complete
const completeModule = async (db, userId, courseId, moduleId) => {
  try {
    // Ensure the user is enrolled in the course
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), enrolledCourses: courseId }
    );
    
    if (!user) {
      throw new Error('Not enrolled in this course');
    }
    
    // Ensure the course and module exist
    const course = await db.collection('courses').findOne(
      { key: courseId, 'modules.id': moduleId }
    );
    
    if (!course) {
      throw new Error('Course or module not found');
    }
    
    // Update the enrollment with module completion
    const now = new Date();
    const updateResult = await db.collection('enrollments').updateOne(
      { studentId: userId, courseId: courseId },
      { 
        $set: { 
          [`moduleProgress.${moduleId}`]: true,
          lastAccessedAt: now,
          updatedAt: now
        } 
      },
      { upsert: true }
    );
    
    // Calculate and update the overall progress
    const enrollment = await db.collection('enrollments').findOne({
      studentId: userId,
      courseId: courseId
    });
    
    const moduleProgress = enrollment.moduleProgress || {};
    const totalModules = course.modules.length;
    const completedModules = Object.values(moduleProgress).filter(Boolean).length;
    const overallProgress = Math.round((completedModules / totalModules) * 100);
    
    await db.collection('enrollments').updateOne(
      { studentId: userId, courseId: courseId },
      { $set: { progress: overallProgress } }
    );
    
    return { 
      message: 'Module marked as complete', 
      moduleId, 
      progress: overallProgress 
    };
  } catch (error) {
    console.error('Error in completeModule:', error);
    throw error;
  }
};

// Submit quiz answers
const submitQuiz = async (db, userId, courseId, quizId, answers) => {
  try {
    // Ensure the user is enrolled in the course
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), enrolledCourses: courseId }
    );
    
    if (!user) {
      throw new Error('Not enrolled in this course');
    }
    
    // Ensure the course and quiz exist
    const course = await db.collection('courses').findOne({ key: courseId });
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Find the quiz in modules
    let quiz = null;
    let moduleId = null;
    
    for (const module of course.modules || []) {
      const foundQuiz = (module.quizzes || []).find(q => q.id === quizId);
      if (foundQuiz) {
        quiz = foundQuiz;
        moduleId = module.id;
        break;
      }
    }
    
    if (!quiz) {
      throw new Error('Quiz not found in this course');
    }
    
    // Calculate score
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    
    const gradedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswer === userAnswer;
      
      if (isCorrect) {
        correctAnswers += 1;
      }
      
      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Save quiz result
    const now = new Date();
    const quizResult = {
      quizId,
      moduleId,
      submittedAt: now,
      score,
      gradedAnswers
    };
    
    await db.collection('enrollments').updateOne(
      { studentId: userId, courseId: courseId },
      { 
        $push: { quizResults: quizResult },
        $set: { 
          lastAccessedAt: now,
          updatedAt: now
        }
      },
      { upsert: true }
    );
    
    // If score is passing, mark module as complete
    if (score >= 70) { // assuming 70% is passing
      await completeModule(db, userId, courseId, moduleId);
    }
    
    return { 
      message: 'Quiz submitted successfully',
      score,
      totalQuestions,
      correctAnswers,
      passed: score >= 70
    };
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    throw error;
  }
};

module.exports = {
  getEnrolledCourses,
  getCourseProgress,
  updateCourseProgress,
  completeModule,
  submitQuiz
};
