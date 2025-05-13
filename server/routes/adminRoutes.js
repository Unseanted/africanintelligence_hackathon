
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const adminServices = require('../services/adminServices');
const {ObjectId} = require('mongodb');

// Get all users
router.get('/users', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await adminServices.getAllUsers(db);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/users/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;
    const user = await adminServices.getUserById(db, userId);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;
    const result = await adminServices.updateUser(db, userId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;
    const result = await adminServices.deleteUser(db, userId);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard
router.get('/dashboard', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const dashboardData = await adminServices.getDashboardStats(db);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities
router.get('/activities', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { limit } = req.query;
    const activities = await adminServices.getRecentActivities(db, Number(limit) || 10);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student details
router.get('/students/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const studentId = req.params.id;
    const studentDetails = await adminServices.getStudentDetails(db, studentId);
    res.json(studentDetails);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facilitator detailed information
router.get('/facilitators/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const facilitatorId = req.params.id;
    const facilitatorDetails = await adminServices.getFacilitatorDetails(db, facilitatorId);
    res.json(facilitatorDetails);
  } catch (error) {
    console.error('Error fetching facilitator details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const analyticsData = await adminServices.getAnalyticsData(db);
    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EVENT TYPES ENDPOINTS

// Get all event types
router.get('/event-types', auth, roleAuth(['facilitator', 'student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventTypes = await adminServices.getAllEventTypes(db);
    res.json(eventTypes);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new event type
router.post('/event-types', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await adminServices.createEventType(db, req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Event type with this name already exists') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creating event type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event type
router.delete('/event-types/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const typeId = req.params.id;
    const result = await adminServices.deleteEventType(db, typeId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Event type not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Cannot delete event type that is being used by events') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error deleting event type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EVENTS ENDPOINTS

// Create a new event
router.post('/events', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await adminServices.createEvent(db, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/events', auth, roleAuth(['facilitator','student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const events = await adminServices.getAllEvents(db);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/events/:id', auth, roleAuth(['facilitator','student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.id;
    const event = await adminServices.getEventById(db, eventId);
    res.json(event);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/events/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.id;
    const result = await adminServices.updateEvent(db, eventId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/events/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.id;
    const result = await adminServices.deleteEvent(db, eventId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register user for event
router.post('/events/:eventId/register/:userId', auth, roleAuth(['facilitator','student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, userId } = req.params;
    const result = await adminServices.registerUserForEvent(db, eventId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error registering user for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove user from event
router.delete('/events/:eventId/register/:userId', auth, roleAuth(['facilitator','student']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, userId } = req.params;
    const result = await adminServices.removeUserFromEvent(db, eventId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error removing user from event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EVENT TEAM ENDPOINTS

// Get all teams for an event
router.get('/events/:eventId/teams', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.eventId;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get teams from the event
    let teams = event.teams || [];
    
    // Populate member details for each team
    if (teams.length > 0) {
      // Get all member IDs from all teams
      const memberIds = new Set();
      teams.forEach(team => {
        if (team.members && Array.isArray(team.members)) {
          team.members.forEach(memberId => memberIds.add(memberId));
        }
      });
      
      // Fetch member details
      const members = await db.collection('users')
        .find(
          { _id: { $in: Array.from(memberIds).map(id => new ObjectId(id)) } },
          { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
        )
        .toArray();
      
      // Create a map for quick lookup
      const memberMap = {};
      members.forEach(member => {
        memberMap[member._id.toString()] = member;
      });
      
      // Add member details to each team
      teams = teams.map(team => ({
        ...team,
        memberDetails: team.members
          ? team.members.map(memberId => memberMap[memberId] || { name: 'Unknown User' })
          : []
      }));
    }
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching event teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific team
router.get('/events/:eventId/teams/:teamId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, teamId } = req.params;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the team
    const team = event.teams?.find(t => t._id.toString() === teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Populate member details
    if (team.members && team.members.length > 0) {
      const memberIds = team.members.map(id => new ObjectId(id));
      
      const members = await db.collection('users')
        .find(
          { _id: { $in: memberIds } },
          { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
        )
        .toArray();
      
      team.memberDetails = members;
    } else {
      team.memberDetails = [];
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team for an event
router.post('/events/:eventId/teams', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const eventId = req.params.eventId;
    const { name, description, leader, members } = req.body;
    
    // Validate required fields
    if (!name || !leader) {
      return res.status(400).json({ message: 'Team name and leader are required' });
    }
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user creating the team is registered for the event
    if (!event.participants || !event.participants.includes(leader)) {
      return res.status(400).json({ message: 'You must be registered for the event to create a team' });
    }
    
    // Check if team name is already taken for this event
    if (event.teams && event.teams.some(team => team.name === name)) {
      return res.status(400).json({ message: 'Team name is already taken' });
    }
    
    // Check if any member is already in a team for this event
    if (event.teams && members && members.length > 0) {
      for (const memberId of members) {
        const isInTeam = event.teams.some(team => 
          team.members && team.members.includes(memberId)
        );
        
        if (isInTeam) {
          return res.status(400).json({ message: 'One or more members are already in a team for this event' });
        }
      }
    }
    
    // Create new team
    const newTeam = {
      _id: new ObjectId(),
      name,
      description: description || '',
      leader,
      members: members || [leader],
      createdAt: new Date()
    };
    
    // Add team to event
    const updateResult = await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { teams: newTeam } }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(201).json({
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team
router.put('/events/:eventId/teams/:teamId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, teamId } = req.params;
    const { name, description } = req.body;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the team
    const teamIndex = event.teams?.findIndex(t => t._id.toString() === teamId);
    
    if (teamIndex === -1 || teamIndex === undefined) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if the user is the team leader or an admin
    const team = event.teams[teamIndex];
    if (team.leader !== req.user.userId && req.user.role !== 'facilitator') {
      return res.status(403).json({ message: 'Only the team leader or admin can update the team' });
    }
    
    // Check if team name is already taken (if changing name)
    if (name && name !== team.name && event.teams.some(t => t.name === name && t._id.toString() !== teamId)) {
      return res.status(400).json({ message: 'Team name is already taken' });
    }
    
    // Update team fields
    if (name) event.teams[teamIndex].name = name;
    if (description !== undefined) event.teams[teamIndex].description = description;
    event.teams[teamIndex].updatedAt = new Date();
    
    // Save the updated event
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { teams: event.teams } }
    );
    
    res.json({
      message: 'Team updated successfully',
      team: event.teams[teamIndex]
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team
router.delete('/events/:eventId/teams/:teamId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, teamId } = req.params;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the team
    const teamIndex = event.teams?.findIndex(t => t._id.toString() === teamId);
    
    if (teamIndex === -1 || teamIndex === undefined) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if the user is the team leader or an admin
    const team = event.teams[teamIndex];
    if (team.leader !== req.user.userId && req.user.role !== 'facilitator') {
      return res.status(403).json({ message: 'Only the team leader or admin can delete the team' });
    }
    
    // Remove the team
    event.teams.splice(teamIndex, 1);
    
    // Save the updated event
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { teams: event.teams } }
    );
    
    res.json({
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to team
router.post('/events/:eventId/teams/:teamId/members/:userId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, teamId, userId } = req.params;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user to be added is registered for the event
    if (!event.participants || !event.participants.includes(userId)) {
      return res.status(400).json({ message: 'User must be registered for the event to join a team' });
    }
    
    // Find the team
    const teamIndex = event.teams?.findIndex(t => t._id.toString() === teamId);
    
    if (teamIndex === -1 || teamIndex === undefined) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if the user is already in another team for this event
    const isInOtherTeam = event.teams.some(t => 
      t._id.toString() !== teamId &&
      t.members && t.members.includes(userId)
    );
    
    if (isInOtherTeam) {
      return res.status(400).json({ message: 'User is already in another team for this event' });
    }
    
    // Check if the user is already in this team
    if (event.teams[teamIndex].members && event.teams[teamIndex].members.includes(userId)) {
      return res.status(400).json({ message: 'User is already in this team' });
    }
    
    // Add the member
    if (!event.teams[teamIndex].members) {
      event.teams[teamIndex].members = [];
    }
    
    event.teams[teamIndex].members.push(userId);
    
    // Save the updated event
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { teams: event.teams } }
    );
    
    res.json({
      message: 'Member added to team successfully',
      team: event.teams[teamIndex]
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from team
router.delete('/events/:eventId/teams/:teamId/members/:userId', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { eventId, teamId, userId } = req.params;
    
    // Check if event exists
    const event = await db.collection('events').findOne({
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the team
    const teamIndex = event.teams?.findIndex(t => t._id.toString() === teamId);
    
    if (teamIndex === -1 || teamIndex === undefined) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const team = event.teams[teamIndex];
    
    // Check permissions: Only team leader, admin, or the user themselves can remove a member
    if (
      team.leader !== req.user.userId && 
      req.user.userId !== userId && 
      req.user.role !== 'facilitator'
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to remove this member' 
      });
    }
    
    // Check if the user to be removed is the leader
    if (team.leader === userId) {
      return res.status(400).json({ 
        message: 'Team leader cannot be removed. The team must be disbanded instead.' 
      });
    }
    
    // Check if the user is in the team
    if (!team.members || !team.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }
    
    // Remove the member
    event.teams[teamIndex].members = team.members.filter(id => id !== userId);
    
    // Save the updated event
    await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { teams: event.teams } }
    );
    
    res.json({
      message: 'Member removed from team successfully',
      team: event.teams[teamIndex]
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DOCUMENTATION ENDPOINTS
router.get('/documentation', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const docs = await adminServices.getDocumentation(db);
    res.json(docs);
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/documentation', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await adminServices.createDocumentation(db, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating documentation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/documentation/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const docId = req.params.id;
    const result = await adminServices.updateDocumentation(db, docId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Documentation not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error updating documentation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/documentation/:id', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const docId = req.params.id;
    const result = await adminServices.deleteDocumentation(db, docId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Documentation not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting documentation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default documentation when server starts
router.get('/initialize-documentation', auth, roleAuth(['facilitator']), async (req, res) => {
  try {
    const db = req.app.locals.db;
    await adminServices.initializeDefaultDocumentation(db);
    res.json({ message: 'Documentation initialized successfully' });
  } catch (error) {
    console.error('Error initializing documentation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
