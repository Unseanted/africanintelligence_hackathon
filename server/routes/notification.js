
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');
const webpush = require('web-push');

// Set VAPID keys - these should be stored in environment variables in production
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = 'Dl3MwLUZxHMPXgAdU8ImzYp0M9wHQ4zXwTYG8FJ7mGg';

webpush.setVapidDetails(
  'mailto:contact@africanintelligence.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Get VAPID public key (for client-side subscription)
router.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Register push subscription
router.post('/register', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }
    
    // Save subscription to database
    await db.collection('push_subscriptions').updateOne(
      { 
        userId: req.user.userId,
        endpoint: subscription.endpoint 
      },
      { 
        $set: {
          userId: req.user.userId,
          subscription,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.status(201).json({ message: 'Subscription registered successfully' });
  } catch (error) {
    console.error('Error registering push subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscribe to notifications for a specific course
router.post('/subscribe/course/:courseId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.courseId;
    
    // Save course subscription preference
    await db.collection('notification_preferences').updateOne(
      { 
        userId: req.user.userId,
        type: 'course',
        entityId: courseId
      },
      {
        $set: {
          userId: req.user.userId,
          type: 'course',
          entityId: courseId,
          subscribed: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.status(201).json({ message: 'Successfully subscribed to course notifications' });
  } catch (error) {
    console.error('Error subscribing to course notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsubscribe from course notifications
router.post('/unsubscribe/course/:courseId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.courseId;
    
    await db.collection('notification_preferences').updateOne(
      { 
        userId: req.user.userId,
        type: 'course',
        entityId: courseId
      },
      {
        $set: {
          subscribed: false,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ message: 'Successfully unsubscribed from course notifications' });
  } catch (error) {
    console.error('Error unsubscribing from course notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const notifications = await db.collection('notifications')
      .find({ recipientId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notificationId = req.params.notificationId;
    
    const result = await db.collection('notifications').updateOne(
      { 
        _id: new ObjectId(notificationId),
        recipientId: req.user.userId
      },
      { 
        $set: { 
          read: true,
          readAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Notification not found or not authorized' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.collection('notifications').updateMany(
      { recipientId: req.user.userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a notification (helper function)
const sendNotification = async (db, recipientId, title, body, data = {}) => {
  try {
    // Create notification in database
    const notification = {
      recipientId,
      title,
      message: body,
      data,
      read: false,
      createdAt: new Date()
    };
    
    const result = await db.collection('notifications').insertOne(notification);
    
    // Get user's subscriptions
    const subscriptions = await db.collection('push_subscriptions')
      .find({ userId: recipientId })
      .toArray();
    
    if (subscriptions.length === 0) {
      return { success: false, message: 'No subscriptions found for user' };
    }
    
    // Send push notification to all user's devices
    const pushPromises = subscriptions.map(sub => {
      const pushPayload = JSON.stringify({
        title,
        body,
        badge: '/graduation-cap.svg',
        icon: '/graduation-cap.svg',
        data: {
          ...data,
          url: data.url || '/',
          notificationId: result.insertedId.toString()
        }
      });
      
      return webpush.sendNotification(sub.subscription, pushPayload)
        .catch(error => {
          console.error('Error sending push notification:', error);
          
          // If subscription has expired, remove it
          if (error.statusCode === 410) {
            return db.collection('push_subscriptions').deleteOne({ 
              userId: recipientId, 
              endpoint: sub.subscription.endpoint 
            });
          }
        });
    });
    
    await Promise.all(pushPromises);
    
    return { success: true, notificationId: result.insertedId };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
};

// Send test notification (for debugging)
router.post('/test', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await sendNotification(
      db,
      req.user.userId,
      'Test Notification',
      'This is a test notification from the African Intelligence LMS.',
      { url: '/student/dashboard' }
    );
    
    if (result.success) {
      res.json({ message: 'Test notification sent successfully' });
    } else {
      res.status(400).json({ message: 'Failed to send test notification', details: result.message });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notification about course updates
router.post('/course-update/:courseId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const courseId = req.params.courseId;
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Get all students enrolled in the course
    const enrollments = await db.collection('enrollments').find({ 
      courseId: new ObjectId(courseId)
    }).toArray();
    
    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'No students enrolled in this course' });
    }
    
    // Get course information
    const course = await db.collection('courses').findOne({ key:courseId });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Send notification to each enrolled student
    const notificationPromises = enrollments.map(enrollment => {
      return sendNotification(
        db,
        enrollment.studentId,
        title,
        message,
        { 
          type: 'course_update',
          courseId,
          courseTitle: course.title,
          url: `/student/courses/${courseId}`
        }
      );
    });
    
    await Promise.all(notificationPromises);
    
    res.json({ message: 'Course update notifications sent successfully' });
  } catch (error) {
    console.error('Error sending course update notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notification to facilitator about new enrollment
const sendEnrollmentNotification = async (db, courseId, studentId, facilitatorId) => {
  try {
    // Get student and course details
    const student = await db.collection('users').findOne({ _id: new ObjectId(studentId) });
    const course = await db.collection('courses').findOne({ key: courseId });
    
    if (!student || !course) {
      return { success: false, message: 'Student or course not found' };
    }
    
    // Send notification
    return await sendNotification(
      db,
      facilitatorId,
      'New Course Enrollment',
      `${student.name} has enrolled in your course "${course.title}"`,
      { 
        type: 'enrollment',
        courseId,
        studentId,
        url: `/facilitator/courses/${courseId}/students`
      }
    );
  } catch (error) {
    console.error('Error sending enrollment notification:', error);
    return { success: false, error };
  }
};

// Send notification for forum activity
const sendForumNotification = async (db, postId, authorId, courseId, recipientIds, isReply = false) => {
  try {
    // Get post details
    const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });
    const author = await db.collection('users').findOne({ _id: new ObjectId(authorId) });
    const course = courseId ? await db.collection('courses').findOne({ key:courseId }) : null;
    
    if (!post || !author) {
      return { success: false, message: 'Post or author not found' };
    }
    
    const notificationPromises = recipientIds.map(recipientId => {
      // Don't notify the author of their own post
      if (recipientId === authorId) {
        return Promise.resolve({ success: true, skipped: true });
      }
      
      const title = isReply 
        ? `New Reply in ${course ? course.title : 'Forum'}`
        : `New Discussion in ${course ? course.title : 'Forum'}`;
        
      const body = isReply
        ? `${author.name} replied to a discussion: "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}"`
        : `${author.name} started a new discussion: "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}"`;
      
      return sendNotification(
        db,
        recipientId,
        title,
        body,
        { 
          type: isReply ? 'forum_reply' : 'forum_post',
          postId: post._id.toString(),
          courseId: courseId || null,
          url: courseId 
            ? `/student/courses/${courseId}/forum/${postId}`
            : `/student/forum/${postId}`
        }
      );
    });
    
    const results = await Promise.all(notificationPromises);
    return { success: true, results };
  } catch (error) {
    console.error('Error sending forum notification:', error);
    return { success: false, error };
  }
};

// Export router and notification functions
module.exports = router;
module.exports.sendNotification = sendNotification;
module.exports.sendEnrollmentNotification = sendEnrollmentNotification;
module.exports.sendForumNotification = sendForumNotification;
