let express = require('express');
let router = express.Router();
let { ObjectId } = require('mongodb');
let auth = require('../middleware/auth');
let roleAuth = require('../middleware/roleAuth');
let { datemap, clg } = require('./basics');


router.get('/latest', async (req, res) => {
  try {
    let db = req.app.locals.db;

    // Fetch the last 6 published courses, sorted by createdAt descending
    let courses = await db.collection('courses')
      .find({ status: 'published' })
      .sort({ 'createdAt.is': -1 })
      .limit(6)
      .toArray();

    // Get facilitator names
    let facilitatorIds = [...new Set(courses.map(course => 
      course.facilitator ? new ObjectId(course.facilitator) : null
    ).filter(id => id !== null))];
    
    let facilitators = facilitatorIds.length > 0 
      ? await db.collection('users')
          .find({ _id: { $in: facilitatorIds } })
          .project({ _id: 1, name: 1 })
          .toArray()
      : [];
    
    let facilitatorMap = {};
    facilitators.forEach(f => {
      facilitatorMap[f._id.toString()] = f.name;
    });

    // Sanitize courses
    let sanitizedCourses = courses.map(course => {
      let facilitatorName = course.facilitator && facilitatorMap[course.facilitator] 
        ? facilitatorMap[course.facilitator] 
        : 'Unknown';

      // Ensure enrolledStudents array exists
      if (!course.enrolledStudents) course.enrolledStudents = [];

      // Sanitize modules: remove quiz answers and content
      if (course.modules) {
        course.modules = course.modules.map(module => {
          // Remove content
          let sanitizedModule = { ...module, content: [] };

          // Sanitize quiz
          if (sanitizedModule.quiz)sanitizedModule.quiz='';

          return sanitizedModule;
        });
      }

      return {
        ...course,
        facilitatorName
      };
    });

    res.json(sanitizedCourses);
  } catch (error) {
    console.error('Error fetching latest courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courses= await db.collection('courses')
      .find({ status: 'published' })
      .toArray();
    
    // Get facilitator names
    let facilitatorIds = [...new Set(courses.map(course => 
      course.facilitator ? new ObjectId(course.facilitator) : null
    ).filter(id => id !== null))];
    
    let facilitators = facilitatorIds.length > 0 
      ? await db.collection('users')
          .find({ _id: { $in: facilitatorIds } })
          .project({ _id: 1, name: 1 })
          .toArray()
      : [];
    
    let facilitatorMap = {};
    facilitators.forEach(f => {
      facilitatorMap[f._id.toString()] = f.name;
    });
    
    let sanitizedCourses = courses.map(course => {
      let facilitatorName = course.facilitator && facilitatorMap[course.facilitator] 
        ? facilitatorMap[course.facilitator] 
        : 'Unknown';
      if(!course.enrolledStudents)course.enrolledStudents=[];
      // Remove quiz answers
      if (course.modules) {
        course.modules.forEach(module => {
          if (module.quiz && module.quiz.questions) {
            module.quiz.questions.forEach(question => {
              if(question.answer!==""||question.answer!==null)question.answer="";
              if (question.options) {
                question.options = question.options.map(option => ({
                  text: option.text
                }));
              }
            });
          }
        });
      }
      
      return {
        ...course,
        facilitatorName
      };
    });
    
    res.json(sanitizedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course ratings
router.get('/:id/ratings', auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    // Get course with reviews
    let course = await db.collection('courses').findOne({ 
      key: courseId 
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!course.reviews || course.reviews.length === 0) {
      return res.json([]);
    }
    
    // Get user details for each review
    let userIds = course.reviews.map(review => review.user);
    let users = await db.collection('users').find(
      { _id: { $in: userIds } },
      { projection: { _id: 1, name: 1, profilePicture: 1 } }
    ).toArray();
    
    // Create a map of user details
    let userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = {
        _id: user._id.toString(),
        name: user.name,
        profilePicture: user.profilePicture
      };
    });
    
    // Add user details to reviews
    let reviewsWithUserDetails = course.reviews.map(review => ({
      _id: review._id || new ObjectId(),
      user: userMap[review.user.toString()] || { name: 'Anonymous' },
      rating: review.rating,
      comment: review.comment,
      date: review.date
    }));
    
    res.json(reviewsWithUserDetails);
  } catch (error) {
    console.error('Error fetching course ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    let objectId;
    try {
      objectId = courseId;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    let course = await db.collection('courses').findOne({ key: objectId });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if(!course.enrolledStudents)course.enrolledStudents=[];
      
    let facilitatorInfo = { name: 'Unknown', email: '' };
    if (course.facilitator) {
      try {
        let facilitator = await db.collection('users').findOne(
          { _id: new ObjectId(course.facilitator) },
          { projection: { name: 1, email: 1 } }
        );
        if (facilitator) {
          facilitatorInfo = { name: facilitator.name, email: facilitator.email };
        }
      } catch (error) {
        console.error('Error fetching facilitator:', error);
      }
    }
    
    if (course.modules) {
      course.modules.forEach(module => {
        if (module.quiz && module.quiz.questions) {
          module.quiz.questions.forEach(question => {
            if (question.options) {
              question.options = question.options.map(option => ({
                text: option.text
              }));
            }
          });
        }
      });
    }
    
    res.json({
      ...course,
      facilitator: facilitatorInfo
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course with full details (including quiz answers)
router.get('/:id/full', auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    let objectId;
    try {
      objectId = courseId;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    let course = await db.collection('courses').findOne({ key: objectId });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if(!course.enrolledStudents)course.enrolledStudents=[];
      
    let facilitatorInfo = { name: 'Unknown', email: '' };
    if (course.facilitator) {
      try {
        let facilitator = await db.collection('users').findOne(
          { _id: new ObjectId(course.facilitator) },
          { projection: { name: 1, email: 1 } }
        );
        if (facilitator) {
          facilitatorInfo = { name: facilitator.name, email: facilitator.email };
        }
      } catch (error) {
        console.error('Error fetching facilitator:', error);
      }
    }
    
    if (req.user.role === 'facilitator' && course.facilitator !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view full course details' });
    }
    
    res.json({
      ...course,
      facilitator: facilitatorInfo
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course
router.post('/', auth, roleAuth(['facilitator', 'admin']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let dt=datemap();
    
    let courseData = {
      ...req.body,
      enrolledStudents:[],
      facilitator: req.user.userId,
      enrolled: 0,
      rating: 0,
      students:[],
      reviews: [],
      key:`course-${dt.key}`,
      createdAt: dt,
      updatedAt: dt
    };
    let pluged=await db.collection('courses').findOne({facilitator:req.user.userId,title:courseData.title});
    if(pluged)return res.status(500).json({ message: 'You Already have a Course with this title, please use a different title' });
    
    let result = await db.collection('courses').insertOne(courseData);
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $push: { createdCourses: result.insertedId.toString() } }
    );
    
    let insertedCourse = await db.collection('courses').findOne({ _id: result.insertedId });
    
    res.status(201).json(insertedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
});

// Update a course
router.put('/:id', auth, roleAuth(['facilitator', 'admin']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    let course = await db.collection('courses').findOne({ key: courseId });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (req.user.role === 'facilitator' && course.facilitator !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    let updateData = {
      ...req.body,
      updatedAt: datemap()
    };
    delete updateData.facilitator;
    
    await db.collection('courses').updateOne(
      { key: courseId },
      { $set: updateData }
    );
    clg(`${courseId} was updated successfully...`)
    let updatedCourse = await db.collection('courses').findOne({ key: courseId });
    
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
});

// Delete a course
router.delete('/:id', auth, roleAuth(['facilitator', 'admin']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    
    let objectId;
    try {
      objectId = courseId;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    let course = await db.collection('courses').findOne({ key: objectId });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (req.user.role === 'facilitator' && course.facilitator !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await db.collection('courses').deleteOne({ key: objectId });
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(course.facilitator) },
      { $pull: { createdCourses: courseId } }
    );
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

// Enroll in a course
router.post('/:id/enroll', auth, roleAuth(['learner']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseKey = req.params.id;
    let learnerId = req.user.userId;
    
    let course = await db.collection('courses').findOne({ key: courseKey });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    let existingEnrollment = await db.collection('enrollments').findOne({
      learner: learnerId,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    let enrollment = {
      learner: learnerId,
      course: courseId,
      progress: 0,
      moduleProgress: course.modules.map(module => ({
        moduleId: module.title,
        completed: false,
        contentProgress: module.content.map(content => ({
          contentId: content.title,
          completed: false
        })),
        quizAttempts: []
      })),
      enrolledAt: new Date(),
      completedAt: null,
      lastAccessed: new Date()
    };
    
    let result = await db.collection('enrollments').insertOne(enrollment);
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(learnerId) },
      { $push: { enrolledCourses: courseId } }
    );
    
    await db.collection('courses').updateOne(
      { key:courseId },
      { $inc: { enrolled: 1 } }
    );
    
    let insertedEnrollment = await db.collection('enrollments').findOne({ 
      _id: result.insertedId 
    });
    
    res.status(201).json(insertedEnrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
});

// Update module progress
router.put('/:courseId/progress', auth, roleAuth(['learner']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let { courseId } = req.params;
    let { moduleId, contentId, completed } = req.body;
    
    let enrollment = await db.collection('enrollments').findOne({ 
      learner: req.user.userId, 
      course: courseId 
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    let moduleIndex = enrollment.moduleProgress.findIndex(
      m => m.moduleId === moduleId
    );
    
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module not found in enrollment' });
    }
    
    let update = {};
    
    if (contentId) {
      let contentIndex = enrollment.moduleProgress[moduleIndex].contentProgress.findIndex(
        c => c.contentId === contentId
      );
      
      if (contentIndex === -1) {
        update = {
          $push: {
            [`moduleProgress.${moduleIndex}.contentProgress`]: {
              contentId,
              completed,
              lastAccessedAt: new Date()
            }
          }
        };
      } else {
        update = {
          $set: {
            [`moduleProgress.${moduleIndex}.contentProgress.${contentIndex}.completed`]: completed,
            [`moduleProgress.${moduleIndex}.contentProgress.${contentIndex}.lastAccessedAt`]: new Date()
          }
        };
      }
    } else {
      update = {
        $set: {
          [`moduleProgress.${moduleIndex}.completed`]: completed
        }
      };
    }
    
    update.$set = {
      ...update.$set,
      lastAccessed: new Date()
    };
    
    await db.collection('enrollments').updateOne(
      { _id: enrollment._id },
      update
    );
    
    let updatedEnrollment = await db.collection('enrollments').findOne({
      _id: enrollment._id
    });
    
    let totalModules = updatedEnrollment.moduleProgress.length;
    let completedModules = updatedEnrollment.moduleProgress.filter(m => m.completed).length;
    let progress = Math.round((completedModules / totalModules) * 100);
    
    await db.collection('enrollments').updateOne(
      { _id: enrollment._id },
      { $set: { progress } }
    );
    
    let finalEnrollment = await db.collection('enrollments').findOne({
      _id: enrollment._id
    });
    
    res.json(finalEnrollment);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
});

// Submit quiz attempt
router.post('/:courseId/modules/:moduleId/quiz', auth, roleAuth(['learner']), async (req, res) => {
  try {
    let db = req.app.locals.db;
    let { courseId, moduleId } = req.params;
    let { answers } = req.body;
    
    let enrollment = await db.collection('enrollments').findOne({ 
      learner: req.user.userId, 
      course: courseId 
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    let course = await db.collection('courses').findOne({
      key: key
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    let module = course.modules.find(m => m.title === moduleId);
    if (!module || !module.quiz) {
      return res.status(404).json({ message: 'Module or quiz not found' });
    }
    
    let score = 0;
    let quiz = module.quiz;
    
    answers.forEach((answer, index) => {
      if (index < quiz.questions.length) {
        let question = quiz.questions[index];
        let correctOptionIndex = question.options.findIndex(option => option.isCorrect);
        
        if (answer === correctOptionIndex) {
          score++;
        }
      }
    });
    
    let scorePercentage = Math.round((score / quiz.questions.length) * 100);
    
    let moduleIndex = enrollment.moduleProgress.findIndex(
      m => m.moduleId === moduleId
    );
    
    if (moduleIndex !== -1) {
      let quizAttempt = {
        score: scorePercentage,
        answers,
        completedAt: new Date()
      };
      
      await db.collection('enrollments').updateOne(
        { _id: enrollment._id },
        { 
          $push: { [`moduleProgress.${moduleIndex}.quizAttempts`]: quizAttempt },
          $set: { lastAccessed: new Date() }
        }
      );
      
      if (scorePercentage >= 70) {
        await db.collection('enrollments').updateOne(
          { _id: enrollment._id },
          { $set: { [`moduleProgress.${moduleIndex}.completed`]: true } }
        );
      }
      
      let updatedEnrollment = await db.collection('enrollments').findOne({
        _id: enrollment._id
      });
      
      let totalModules = updatedEnrollment.moduleProgress.length;
      let completedModules = updatedEnrollment.moduleProgress.filter(m => m.completed).length;
      let progress = Math.round((completedModules / totalModules) * 100);
      
      await db.collection('enrollments').updateOne(
        { _id: enrollment._id },
        { $set: { progress } }
      );
    }
    
    res.json({ 
      score: scorePercentage,
      passed: scorePercentage >= 70
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
});

// Rate a course
router.post('/:id/rate', auth, async (req, res) => {
  try {
    let db = req.app.locals.db;
    let courseId = req.params.id;
    let { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value. Must be between 1 and 5.' });
    }
    
    // Check if course exists
    let course = await db.collection('courses').findOne({ 
      key: courseId 
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student is enrolled in the course
    let enrollment = await db.collection('enrollments').findOne({
      courseId: courseId,
      studentId: req.user.userId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to rate it' });
    }
    
    // Get user details
    let user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { name: 1, profilePicture: 1 } }
    );
    
    // Check if user already rated this course
    let existingRatingIndex = course.reviews ? 
      course.reviews.findIndex(r => r.user.toString() === req.user.userId) : -1;
    
    let updatedReviews = course.reviews || [];
    
    let reviewData = {
      user: new ObjectId(req.user.userId),
      rating: rating,
      comment: comment || '',
      date: new Date()
    };
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      updatedReviews[existingRatingIndex] = reviewData;
    } else {
      // Add new rating
      updatedReviews.push(reviewData);
    }
    
    // Calculate new average rating
    let totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
    let averageRating = totalRating / updatedReviews.length;
    
    // Update course with new rating data
    await db.collection('courses').updateOne(
      { key: courseId },
      { 
        $set: { 
          reviews: updatedReviews,
          rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
        } 
      }
    );
    
    res.json({ 
      message: 'Rating submitted successfully',
      rating: rating,
      averageRating: Math.round(averageRating * 10) / 10
    });
  } catch (error) {
    console.error('Error rating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
