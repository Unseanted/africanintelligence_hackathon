const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/mailer');
const { vapid_private_key, clientID } = require('../configs/config');
const { clg } = require('./basics');
const { body, validationResult } = require('express-validator');

const googleClient = new OAuth2Client(clientID);

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection('users')
      .find()
      .toArray();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      profilePicture: '',
      bio: '',
      enrolledCourses: [],
      createdCourses: [],
      createdAt: new Date()
    };
    
    // Insert user into database
    const result = await db.collection('users').insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), role: newUser.role },
      vapid_private_key,
      { expiresIn: '7d' }
    );
    
    // Return user data and token (without password)
    const userData = {
      id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    
    // Get popular courses for welcome email
    const popularCourses = await db.collection('courses')
      .find({ status: 'published' })
      .sort({ enrollmentCount: -1 })
      .limit(3)
      .toArray();
    
    // Send welcome email asynchronously
    sendWelcomeEmail(userData, popularCourses).catch(error => {
      console.error('Failed to send welcome email:', error);
    });
    
    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password, role } = req.body;
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify role if provided
    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Invalid credentials or role' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      vapid_private_key,
      { expiresIn: '7d' }
    );
    
    // Return user data and token (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(200).json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google OAuth login/signup
router.post('/google', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { token, role } = req.body;
    clg('google body -- ',{role})

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: clientID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || 'User';

    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token: Email not found' });
    }

    // Check if user exists
    let user = await db.collection('users').findOne({ email });

    if (user) {
      // User exists - verify role and log them in
      if (role && user.role !== role) {
        return res.status(403).json({ message: 'Invalid role for existing user' });
      }
    } else {
      // User doesn't exist - register them
      const newUser = {
        name,
        email,
        password: '', // No password for Google users
        role: role || 'student',
        profilePicture: payload.picture || '',
        bio: '',
        enrolledCourses: [],
        createdCourses: [],
        createdAt: new Date(),
        authProvider: 'google', // Indicate the user signed up via Google
      };

      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };

      // Get popular courses for welcome email
      const popularCourses = await db.collection('courses')
        .find({ status: 'published' })
        .sort({ enrollmentCount: -1 })
        .limit(3)
        .toArray();

      // Send welcome email asynchronously
      sendWelcomeEmail({ id: user._id, name: user.name, email: user.email, role: user.role }, popularCourses)
        .catch(error => {
          console.error('Failed to send welcome email:', error);
        });
    }

    // Generate JWT token
    const jwtToken = await jwt.sign(
      { userId: user._id.toString(), role: user.role },
      vapid_private_key,
      { expiresIn: '7d' }
    );

    // Return user data and token (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };
    clg('user data -- ',userData)
    res.status(200).json({ user: userData,success:true, token: jwtToken });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = new ObjectId(req.user.userId);
    
    // Get user from database (excluding password)
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      enrolledCourses: user.enrolledCourses,
      createdCourses: user.createdCourses,
      createdAt: user.createdAt,
      authProvider: user.authProvider || 'local',
      phone: user.phone || '+234 000 000 0000',
      occupation: user.occupation || 'unknown',
      address: user.address || 'unknown',
      specialization: user.specialization || 'unknown',
      experience: user.experience || 0,
      certifications: user.certifications || [],
      education: user.education || []
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
});

// POST /update-user - Update user profile
router.post(
  '/update-user',
  auth,
  [
    // Validation rules
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').trim().optional().isMobilePhone().withMessage('Invalid phone number'),
    body('bio').trim().optional(),
    body('occupation').trim().notEmpty().withMessage('Occupation is required'),
    body('address').trim().optional(),
    body('specialization').trim().optional(),
    body('experience').optional().isNumeric().withMessage('Experience must be a number'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    body('certifications').optional().isArray().withMessage('Certifications must be an array'),
    body('certifications.*.title').trim().notEmpty().withMessage('Certification title is required'),
    body('certifications.*.verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('education.*.degree').trim().notEmpty().withMessage('Degree is required'),
    body('education.*.institution').trim().notEmpty().withMessage('Institution is required'),
    body('education.*.years').trim().notEmpty().withMessage('Years are required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, email, phone, bio, occupation, address, specialization, experience, profilePicture, certifications, education } = req.body;

    try {
      const db = req.app.locals.db;
      const userId = new ObjectId(req.user.userId);

      // Find the user by ID
      const user = await db.collection('users').findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check if the email is already used by another user
      if (email !== user.email) {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
          return res.status(400).json({ success: false, error: 'Email already in use' });
        }
      }

      // Update user fields
      const updatedUser = {
        name,
        email,
        phone: phone || user.phone,
        bio: bio || user.bio,
        occupation: occupation || user.occupation,
        address: address || user.address,
        specialization: specialization || user.specialization,
        experience: experience || user.experience,
        profilePicture: profilePicture || user.profilePicture,
        certifications: certifications || user.certifications,
        education: education || user.education,
      };

      // Update the user in the database
      await db.collection('users').updateOne(
        { _id: userId },
        { $set: updatedUser }
      );

      // Fetch the updated user (excluding password)
      const updatedUserData = await db.collection('users').findOne(
        { _id: userId },
        { projection: { password: 0 } }
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUserData,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// POST /profilepicture - Update user's profile picture
router.post(
  '/profilepicture',
  auth,
  [
    body('profilePicture').isURL().withMessage('Profile picture must be a valid URL'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { profilePicture } = req.body;

    try {
      const db = req.app.locals.db;
      const userId = new ObjectId(req.user.userId);

      // Find the user by ID
      const user = await db.collection('users').findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Update the profile picture
      await db.collection('users').updateOne(
        { _id: userId },
        { $set: { profilePicture } }
      );

      // Fetch the updated user (excluding password)
      const updatedUser = await db.collection('users').findOne(
        { _id: userId },
        { projection: { password: 0 } }
      );

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

module.exports = router;