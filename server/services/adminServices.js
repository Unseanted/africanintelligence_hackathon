
const { ObjectId } = require('mongodb');
const { clg } = require('../routes/basics');
const { findAll } = require('./globalServices');

// Get all users
const getAllUsers = async (db) => {
  try {
    const users = await db.collection('users')
      .find()
      .project({ password: 0 }) // Exclude password field
      .sort({ createdAt: -1 })
      .toArray();

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (db, userId) => {
  try {
    const user = await db.collection('users').aggregate([
      {
        $match: { _id: new ObjectId(userId) }
      },
      {
        $lookup: {
          from: 'summaries',
          localField: '_id',
          foreignField: 'userId',
          as: 'summary'
        }
      },
      {
        $unwind: {
          path: '$summary',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          let: { userId: '$_id', enrolledCourses: '$enrolledCourses' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $toObjectId: '$studentId' }, '$$userId'] },
                    { $in: ['$courseId', '$$enrolledCourses'] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: 'key',
                as: 'course'
              }
            },
            {
              $unwind: {
                path: '$course',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { facilitatorId: '$course.facilitator' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [
                          { $eq: ['$_id', { $toObjectId: '$$facilitatorId' }] },
                          { $eq: ['$_id', '$$facilitatorId'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'facilitator'
              }
            },
            {
              $unwind: {
                path: '$facilitator',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                courseId: 1,
                enrolledAt: 1,
                progress: 1,
                moduleProgress: 1,
                lastAccessedAt: 1,
                title: '$course.title',
                facilitatorName: { $ifNull: ['$facilitator.name', 'Unknown'] }
              }
            }
          ],
          as: 'enrollments'
        }
      },
      {
        $project: {
          password: 0
        }
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          name: 1,
          email: 1,
          role: 1,
          bio: 1,
          createdAt: 1,
          updatedAt: 1,
          lastLogin: 1,
          enrolledCourses: 1,
          summary: 1,
          enrollments: 1
        }
      }
    ]).toArray();

    if (!user || user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Update user
const updateUser = async (db, userId, updateData) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    const { name, email, role, bio } = updateData;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (bio) updateFields.bio = bio;

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    return {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio
      }
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
const deleteUser = async (db, userId) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (db) => {
  try {
    // Get counts
    const userCount = await db.collection('users').countDocuments();
    const learnerCount = await db.collection('users').countDocuments({ role: 'student' });
    const facilitatorCount = await db.collection('users').countDocuments({ role: 'facilitator' });
    const courseCount = await db.collection('courses').countDocuments();
    const publishedCourseCount = await db.collection('courses').countDocuments({ status: 'published' });
    const enrollmentCount = await db.collection('enrollments').countDocuments();

    // Get recent users
    const recentUsers = await db.collection('users')
      .find()
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get popular courses
    const popularCourses = await db.collection('courses')
      .find()
      .sort({ enrolled: -1 })
      .limit(5)
      .toArray();

    // Manually populate facilitator data
    const facilitatorIds = [...new Set(popularCourses.map(course => course.facilitator).filter(id => id))];
    const facilitators = await db.collection('users')
      .find(
        { _id: { $in: facilitatorIds.map(id => new ObjectId(id)) } },
        { projection: { name: 1 } }
      )
      .toArray();

    const facilitatorMap = {};
    facilitators.forEach(f => {
      facilitatorMap[f._id.toString()] = { _id: f._id, name: f.name };
    });

    const populatedCourses = popularCourses.map(course => ({
      ...course,
      facilitator: course.facilitator ? facilitatorMap[course.facilitator] || { name: 'Unknown' } : { name: 'Unknown' }
    }));

    return {
      stats: {
        totalUsers: userCount,
        learners: learnerCount,
        facilitators: facilitatorCount,
        courses: courseCount,
        publishedCourses: publishedCourseCount,
        enrollments: enrollmentCount
      },
      recentUsers,
      popularCourses: populatedCourses
    };
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
};

// Get student detailed information
const getStudentDetails = async (db, studentId) => {
  try {
    const student = await db.collection('users').aggregate([
      {
        $match: { _id: new ObjectId(studentId), role: 'student' }
      },
      {
        $lookup: {
          from: 'summaries',
          localField: '_id',
          foreignField: 'userId',
          as: 'summary'
        }
      },
      {
        $unwind: {
          path: '$summary',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0,
          _id: { $toString: '$_id' },
          name: 1,
          email: 1,
          role: 1,
          bio: 1,
          createdAt: 1,
          updatedAt: 1,
          lastLogin: 1,
          enrolledCourses: 1,
          summary: '$summary'
        }
      }
    ]).toArray();

    if (!student || student.length === 0) {
      throw new Error('Student not found');
    }

    return student[0];
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

// Get facilitator detailed information
const getFacilitatorDetails = async (db, facilitatorId) => {
  try {
    const facilitator = await db.collection('users').aggregate([
      {
        $match: { _id: new ObjectId(facilitatorId), role: 'facilitator' }
      },
      {
        $lookup: {
          from: 'summaries',
          localField: '_id',
          foreignField: 'userId',
          as: 'summary'
        }
      },
      {
        $unwind: {
          path: '$summary',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0,
          _id: { $toString: '$_id' },
          name: 1,
          email: 1,
          role: 1,
          bio: 1,
          createdAt: 1,
          updatedAt: 1,
          lastLogin: 1,
          enrolledCourses: 1,
          summary: '$summary'
        }
      }
    ]).toArray();

    if (!facilitator || facilitator.length === 0) {
      throw new Error('Facilitator not found');
    }

    return facilitator[0];
  } catch (error) {
    console.error('Error fetching facilitator details:', error);
    throw error;
  }
};

// Get analytics data
const getAnalyticsData = async (db) => {
  try {
    const userCount = await db.collection('users').countDocuments();
    const learnerCount = await db.collection('users').countDocuments({ role: 'student' });
    const facilitatorCount = await db.collection('users').countDocuments({ role: 'facilitator' });
    const courseCount = await db.collection('courses').countDocuments();
    const publishedCourseCount = await db.collection('courses').countDocuments({ status: 'published' });
    const enrollmentCount = await db.collection('enrollments').countDocuments();

    return {
      totalUsers: userCount,
      learners: learnerCount,
      facilitators: facilitatorCount,
      courses: courseCount,
      publishedCourses: publishedCourseCount,
      enrollments: enrollmentCount
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Get all event types
const getAllEventTypes = async (db) => {
  try {
    const eventTypes = await db.collection('event_types').find().sort({ name: 1 }).toArray();
    return eventTypes;
  } catch (error) {
    console.error('Error fetching event types:', error);
    throw error;
  }
};

// Create a new event type
const createEventType = async (db, data) => {
  try {
    const { name, description, color } = data;
    
    // Check if event type with same name already exists
    const existingType = await db.collection('event_types').findOne({ name });
    if (existingType) {
      throw new Error('Event type with this name already exists');
    }
    
    const eventType = {
      name,
      description: description || '',
      color: color || '#8B5CF6', // Default purple color
      createdAt: new Date()
    };
    
    const result = await db.collection('event_types').insertOne(eventType);
    return {
      message: 'Event type created successfully',
      eventType: {
        ...eventType,
        _id: result.insertedId
      }
    };
  } catch (error) {
    console.error('Error creating event type:', error);
    throw error;
  }
};

// Delete an event type
const deleteEventType = async (db, typeId) => {
  try {
    // Check if event type exists
    const eventType = await db.collection('event_types').findOne({ _id: new ObjectId(typeId) });
    if (!eventType) {
      throw new Error('Event type not found');
    }
    
    // Check if there are any events using this type
    const eventsUsingType = await db.collection('events').countDocuments({ eventType: typeId });
    if (eventsUsingType > 0) {
      throw new Error('Cannot delete event type that is being used by events');
    }
    
    await db.collection('event_types').deleteOne({ _id: new ObjectId(typeId) });
    return { message: 'Event type deleted successfully' };
  } catch (error) {
    console.error('Error deleting event type:', error);
    throw error;
  }
};

// Create a new event
const createEvent = async (db, eventData) => {
  try {
    const event = {
      ...eventData,
      createdAt: new Date(),
      participants: [],
      status: eventData.status || 'upcoming'
    };
    
    const result = await db.collection('events').insertOne(event);
    
    return {
      message: 'Event created successfully',
      event: {
        ...event,
        _id: result.insertedId
      }
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get all events
const getAllEvents = async (db) => {
  try {
    const events = await db.collection('events')
      .find()
      .sort({ eventDate: 1 })
      .toArray();
    
    // Populate event type information
    const eventTypeIds = [...new Set(events
      .filter(event => event.eventType)
      .map(event => event.eventType))];
      
    const eventTypes = eventTypeIds.length > 0 ? 
      await db.collection('event_types')
        .find({ _id: { $in: eventTypeIds.map(id => new ObjectId(id)) } })
        .toArray() : [];
    
    const eventTypeMap = {};
    eventTypes.forEach(type => {
      eventTypeMap[type._id.toString()] = type;
    });
    
    // Add event type details to each event
    const enrichedEvents = events.map(event => {
      if (event.eventType && eventTypeMap[event.eventType]) {
        return {
          ...event,
          eventTypeDetails: eventTypeMap[event.eventType]
        };
      }
      return event;
    });
    
    return enrichedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get event by ID
const getEventById = async (db, eventId) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Get participants info if there are any
    if (event.participants && event.participants.length > 0) {
      const participants = await db.collection('users')
        .find(
          { _id: { $in: event.participants.map(id => new ObjectId(id)) } },
          { projection: { name: 1, email: 1, role: 1 } }
        )
        .toArray();
      
      event.participantDetails = participants;
    } else {
      event.participantDetails = [];
    }
    
    // Get event type details if available
    if (event.eventType) {
      const eventType = await db.collection('event_types').findOne({
        _id: new ObjectId(event.eventType)
      });
      
      if (eventType) {
        event.eventTypeDetails = eventType;
      }
    }
    
    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};

// Update event
const updateEvent = async (db, eventId, updateData) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    const updatedEvent = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    return {
      message: 'Event updated successfully',
      event: updatedEvent
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
const deleteEvent = async (db, eventId) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
    
    return {
      message: 'Event deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Register user for event
const registerUserForEvent = async (db, eventId, userId) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is already registered
    if (event.participants && event.participants.includes(userId)) {
      return {
        message: 'User already registered for this event',
        alreadyRegistered: true
      };
    }
    
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { participants: userId } }
    );
    
    return {
      message: 'User registered for event successfully'
    };
  } catch (error) {
    console.error('Error registering user for event:', error);
    throw error;
  }
};

// Remove user from event
const removeUserFromEvent = async (db, eventId, userId) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $pull: { participants: userId } }
    );
    
    return {
      message: 'User removed from event successfully'
    };
  } catch (error) {
    console.error('Error removing user from event:', error);
    throw error;
  }
};

// Get recent activities for dashboard
const getRecentActivities = async (db, limit = 10) => {
  try {
    // Get recent enrollments
    const recentEnrollments = await db.collection('enrollments')
      .find()
      .sort({ enrolledAt: -1 })
      .limit(limit)
      .toArray();
      
    // Get user and course info for enrollments
    const userIds = [...new Set(recentEnrollments.map(e => e.studentId))];
    const courseIds = [...new Set(recentEnrollments.map(e => e.courseId))];
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ name: 1, email: 1 })
      .toArray();
      
    const courses = await db.collection('courses')
      .find({ key: { $in: courseIds } })
      .project({ title: 1, key: 1 })
      .toArray();
      
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const courseMap = {};
    courses.forEach(c => { courseMap[c.key] = c; });
    
    // Get recent forum posts
    const recentPosts = await db.collection('forums')
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
      
    // Get authors for forum posts
    const postAuthorIds = [...new Set(recentPosts.map(p => p.author))];
    const postAuthors = await db.collection('users')
      .find({ _id: { $in: postAuthorIds.map(id => new ObjectId(id)) } })
      .project({ name: 1 })
      .toArray();
      
    const postAuthorMap = {};
    postAuthors.forEach(a => { postAuthorMap[a._id.toString()] = a; });
    
    // Get recent course creations
    const recentCourses = await db.collection('courses')
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
      
    // Get facilitator info for courses
    const facilitatorIds = [...new Set(recentCourses
      .map(c => c.facilitator)
      .filter(id => id))];
      
    const facilitators = await db.collection('users')
      .find({ _id: { $in: facilitatorIds.map(id => new ObjectId(id)) } })
      .project({ name: 1 })
      .toArray();
      
    const facilitatorMap = {};
    facilitators.forEach(f => { facilitatorMap[f._id.toString()] = f; });
    
    // Get recent user registrations
    const recentUsers = await db.collection('users')
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
      
    // Combine all activities into one timeline
    const activities = [
      ...recentEnrollments.map(enrollment => ({
        type: 'enrollment',
        date: enrollment.enrolledAt,
        user: userMap[enrollment.studentId] || { name: 'Unknown User' },
        course: courseMap[enrollment.courseId] || { title: 'Unknown Course' },
        data: enrollment
      })),
      ...recentPosts.map(post => ({
        type: 'forum_post',
        date: post.createdAt,
        user: postAuthorMap[post.author] || { name: 'Unknown User' },
        title: post.title,
        data: post
      })),
      ...recentCourses.map(course => ({
        type: 'course_creation',
        date: course.createdAt,
        title: course.title,
        facilitator: facilitatorMap[course.facilitator] || { name: 'Unknown Facilitator' },
        data: course
      })),
      ...recentUsers.map(user => ({
        type: 'user_registration',
        date: user.createdAt,
        user: { name: user.name, email: user.email },
        role: user.role,
        data: { _id: user._id }
      }))
    ];
    
    // Sort by date, most recent first
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to requested number
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// API Documentation Services

// Get all API documentation
const getDocumentation = async (db) => {
  try {
    const docs = await db.collection('documentation')
      .find()
      .sort({ category: 1, endpoint: 1 })
      .toArray();
    
    return docs;
  } catch (error) {
    console.error('Error fetching documentation:', error);
    throw error;
  }
};

// Create documentation entry
const createDocumentation = async (db, data) => {
  try {
    const { endpoint, method, description, category, payload, response } = data;
    
    // Basic validation
    if (!endpoint || !method || !description) {
      throw new Error('Endpoint, method and description are required');
    }
    
    const docEntry = {
      endpoint,
      method,
      description,
      category: category || 'other',
      payload: payload || {},
      response: response || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('documentation').insertOne(docEntry);
    
    return {
      message: 'Documentation created successfully',
      doc: {
        ...docEntry,
        _id: result.insertedId
      }
    };
  } catch (error) {
    console.error('Error creating documentation:', error);
    throw error;
  }
};

// Update documentation
const updateDocumentation = async (db, docId, data) => {
  try {
    // Verify document exists
    const doc = await db.collection('documentation').findOne({
      _id: new ObjectId(docId)
    });
    
    if (!doc) {
      throw new Error('Documentation not found');
    }
    
    const { endpoint, method, description, category, payload, response } = data;
    
    // Basic validation
    if (!endpoint || !method || !description) {
      throw new Error('Endpoint, method and description are required');
    }
    
    const updateData = {
      endpoint,
      method,
      description,
      category: category || 'other',
      payload: payload || {},
      response: response || {},
      updatedAt: new Date()
    };
    
    await db.collection('documentation').updateOne(
      { _id: new ObjectId(docId) },
      { $set: updateData }
    );
    
    return {
      message: 'Documentation updated successfully',
      doc: {
        ...updateData,
        _id: docId
      }
    };
  } catch (error) {
    console.error('Error updating documentation:', error);
    throw error;
  }
};

// Delete documentation
const deleteDocumentation = async (db, docId) => {
  try {
    // Verify document exists
    const doc = await db.collection('documentation').findOne({
      _id: new ObjectId(docId)
    });
    
    if (!doc) {
      throw new Error('Documentation not found');
    }
    
    await db.collection('documentation').deleteOne({ _id: new ObjectId(docId) });
    
    return {
      message: 'Documentation deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting documentation:', error);
    throw error;
  }
};

// Default documentation data to initialize system
const initializeDefaultDocumentation = async (db) => {
  const defaultDocs = [
    // Authentication endpoints
    {
      endpoint: "/api/auth/register",
      method: "POST",
      description: "Register a new user",
      category: "auth",
      payload: { name: "John Doe", email: "john@example.com", password: "securePassword123", role: "student" },
      response: { user: { id: "123456789", name: "John Doe", email: "john@example.com" }, token: "jwt-token-here" }
    },
    {
      endpoint: "/api/auth/login",
      method: "POST",
      description: "Authenticate user and get token",
      category: "auth",
      payload: { email: "john@example.com", password: "securePassword123" },
      response: { user: { id: "123456789", name: "John Doe", email: "john@example.com" }, token: "jwt-token-here" }
    },
    {
      endpoint: "/api/auth/verify-email/:token",
      method: "GET",
      description: "Verify email address",
      category: "auth",
      payload: {},
      response: { message: "Email verified successfully" }
    },
    // Course endpoints
    {
      endpoint: "/api/courses",
      method: "GET",
      description: "Get all published courses",
      category: "courses",
      payload: {},
      response: [
        { 
          _id: "c123456", 
          title: "Introduction to AI", 
          description: "Learn the fundamentals of AI",
          status: "published",
          facilitator: "f123456"
        }
      ]
    },
    {
      endpoint: "/api/courses/:id",
      method: "GET",
      description: "Get course details by ID",
      category: "courses",
      payload: {},
      response: { 
        _id: "c123456", 
        title: "Introduction to AI", 
        description: "Learn the fundamentals of AI",
        modules: [
          {
            id: "m1",
            title: "What is AI?",
            content: "AI stands for artificial intelligence..."
          }
        ]
      }
    },
    // Learner endpoints
    {
      endpoint: "/api/learner/courses",
      method: "GET",
      description: "Get student's enrolled courses",
      category: "learner",
      payload: {},
      response: [
        { 
          courseId: "c123456", 
          title: "Introduction to AI",
          progress: 75,
          lastAccessedAt: "2025-05-09T10:30:00Z"
        }
      ]
    },
    // Event endpoints
    {
      endpoint: "/api/admin/events",
      method: "GET",
      description: "Get all events",
      category: "events",
      payload: {},
      response: [
        {
          _id: "e123456",
          title: "AI Hackathon 2025",
          description: "Annual AI hackathon",
          eventDate: "2025-06-15T09:00:00Z",
          status: "upcoming"
        }
      ]
    },
    // Team endpoints
    {
      endpoint: "/api/admin/events/:eventId/teams",
      method: "GET",
      description: "Get teams for an event",
      category: "teams",
      payload: {},
      response: [
        {
          _id: "t123456",
          name: "Team Alpha",
          description: "The A team",
          leader: "user123",
          members: ["user123", "user456"]
        }
      ]
    },
    {
      endpoint: "/api/admin/events/:eventId/teams",
      method: "POST",
      description: "Create a team for an event",
      category: "teams",
      payload: {
        name: "Team Beta",
        description: "The B team",
        leader: "user789"
      },
      response: {
        message: "Team created successfully",
        team: {
          _id: "t789012",
          name: "Team Beta",
          description: "The B team",
          leader: "user789",
          members: ["user789"]
        }
      }
    }
  ];
  
  // Check if documentation collection is empty
  const count = await db.collection('documentation').countDocuments();
  
  if (count === 0) {
    console.log('Initializing default API documentation...');
    await db.collection('documentation').insertMany(defaultDocs);
    console.log('Default API documentation added!');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getStudentDetails,
  getFacilitatorDetails,
  getAnalyticsData,
  getAllEventTypes,
  createEventType,
  deleteEventType,
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerUserForEvent,
  removeUserFromEvent,
  getRecentActivities,
  // Documentation services
  getDocumentation,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
  initializeDefaultDocumentation
};
