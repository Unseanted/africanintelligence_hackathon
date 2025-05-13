
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    // Find all chats where user is a participant
    const chats = await db.collection('chats')
      .find({ participants: userId })
      .sort({ lastMessage: -1 })
      .toArray();

    // Fetch participant details
    const participantIds = [...new Set(chats.flatMap(chat => chat.participants))];
    const participants = await db.collection('users')
      .find(
        { _id: { $in: participantIds.map(id => new ObjectId(id)) } },
        { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
      )
      .toArray();

    const participantMap = {};
    participants.forEach(p => {
      participantMap[p._id.toString()] = {
        _id: p._id,
        name: p.name,
        email: p.email,
        profilePicture: p.profilePicture,
        role: p.role
      };
    });

    // Format chat data for response
    const formattedChats = chats.map(chat => {
      const populatedParticipants = chat.participants.map(id => participantMap[id.toString()] || {
        _id: id,
        name: 'Unknown',
        email: '',
        profilePicture: '',
        role: ''
      });
      const otherParticipants = populatedParticipants.filter(p => p._id.toString() !== userId);

      return {
        id: chat._id,
        isGroupChat: chat.isGroupChat,
        name: chat.isGroupChat
          ? chat.groupName
          : otherParticipants.length > 0
            ? otherParticipants[0].name
            : 'Chat',
        participants: populatedParticipants,
        lastMessageDate: chat.lastMessage,
        unreadCount: chat.messages.filter(
          m => m.sender.toString() !== userId && !m.readBy.includes(userId)
        ).length
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const chatId = req.params.id;

    // Find the chat
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    // Fetch participant and sender details
    const participantIds = [...new Set(chat.participants.concat(chat.messages.map(m => m.sender)))];
    const users = await db.collection('users')
      .find(
        { _id: { $in: participantIds.map(id => new ObjectId(id)) } },
        { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
      )
      .toArray();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = {
        _id: u._id,
        name: u.name,
        email: u.email,
        profilePicture: u.profilePicture,
        role: u.role
      };
    });

    // Mark messages as read
    const updatedMessages = chat.messages.map(message => {
      if (message.sender.toString() !== userId && !message.readBy.includes(userId)) {
        return { ...message, readBy: [...message.readBy, userId] };
      }
      return message;
    });

    await db.collection('chats').updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { messages: updatedMessages } }
    );

    // Populate participants and messages
    const populatedParticipants = chat.participants.map(id => userMap[id.toString()] || {
      _id: id,
      name: 'Unknown',
      email: '',
      profilePicture: '',
      role: ''
    });
    const populatedMessages = updatedMessages.map(m => ({
      ...m,
      sender: userMap[m.sender.toString()] || {
        _id: m.sender,
        name: 'Unknown',
        profilePicture: '',
        role: ''
      }
    }));

    res.json({
      id: chat._id,
      isGroupChat: chat.isGroupChat,
      name: chat.isGroupChat ? chat.groupName : null,
      participants: populatedParticipants,
      messages: populatedMessages
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new chat or get existing
router.post('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { participants, isGroup, groupName } = req.body;
    const userId = req.user.userId;

    // Ensure current user is included in participants
    const allParticipants = [...new Set([userId, ...participants])];

    // For non-group chats, check if chat already exists between these users
    if (!isGroup && participants.length === 1) {
      const existingChat = await db.collection('chats').findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: allParticipants.length }
      });

      if (existingChat) {
        const participantData = await db.collection('users')
          .find(
            { _id: { $in: existingChat.participants.map(id => new ObjectId(id)) } },
            { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
          )
          .toArray();

        const participantMap = {};
        participantData.forEach(p => {
          participantMap[p._id.toString()] = {
            _id: p._id,
            name: p.name,
            email: p.email,
            profilePicture: p.profilePicture,
            role: p.role
          };
        });

        const populatedParticipants = existingChat.participants.map(id => participantMap[id.toString()] || {
          _id: id,
          name: 'Unknown',
          email: '',
          profilePicture: '',
          role: ''
        });

        return res.json({
          id: existingChat._id,
          isGroupChat: existingChat.isGroupChat,
          participants: populatedParticipants,
          messages: existingChat.messages
        });
      }
    }

    // Create new chat
    const newChat = {
      participants: allParticipants,
      isGroupChat: isGroup || false,
      groupName: isGroup ? groupName : null,
      messages: [],
      lastMessage: null
    };

    const result = await db.collection('chats').insertOne(newChat);
    const insertedChat = await db.collection('chats').findOne({ _id: result.insertedId });

    // Populate participants
    const participantData = await db.collection('users')
      .find(
        { _id: { $in: insertedChat.participants.map(id => new ObjectId(id)) } },
        { projection: { name: 1, email: 1, profilePicture: 1, role: 1 } }
      )
      .toArray();

    const participantMap = {};
    participantData.forEach(p => {
      participantMap[p._id.toString()] = {
        _id: p._id,
        name: p.name,
        email: p.email,
        profilePicture: p.profilePicture,
        role: p.role
      };
    });

    const populatedParticipants = insertedChat.participants.map(id => participantMap[id.toString()] || {
      _id: id,
      name: 'Unknown',
      email: '',
      profilePicture: '',
      role: ''
    });

    res.status(201).json({
      id: insertedChat._id,
      isGroupChat: insertedChat.isGroupChat,
      name: insertedChat.isGroupChat ? insertedChat.groupName : null,
      participants: populatedParticipants,
      messages: insertedChat.messages
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { content } = req.body;
    const userId = req.user.userId;
    const chatId = req.params.id;

    // Find the chat
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Add message
    const newMessage = {
      sender: userId,
      content,
      readBy: [userId],
      createdAt: new Date()
    };

    await db.collection('chats').updateOne(
      { _id: new ObjectId(chatId) },
      {
        $push: { messages: newMessage },
        $set: { lastMessage: new Date() }
      }
    );

    // Fetch updated chat
    const updatedChat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    const addedMessage = updatedChat.messages[updatedChat.messages.length - 1];

    // Populate sender
    const sender = await db.collection('users')
      .findOne(
        { _id: new ObjectId(addedMessage.sender) },
        { projection: { name: 1, profilePicture: 1, role: 1 } }
      );

    const populatedMessage = {
      ...addedMessage,
      sender: sender ? {
        _id: sender._id,
        name: sender.name,
        profilePicture: sender.profilePicture,
        role: sender.role
      } : {
        _id: addedMessage.sender,
        name: 'Unknown',
        profilePicture: '',
        role: ''
      }
    };

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available users to chat with
router.get('/users/available', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    // Find users excluding the current user
    const users = await db.collection('users')
      .find({ _id: { $ne: new ObjectId(userId) } })
      .project({ name: 1, email: 1, profilePicture: 1, role: 1 })
      .sort({ name: 1 })
      .toArray();

    res.json(users);
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const User = require('../models/User');
// const auth = require('../middleware/auth');

// // Get user's chats
// router.get('/', auth, async (req, res) => {
//   try {
//     const userId = req.user.userId;
    
//     // Find all chats where user is a participant
//     const chats = await Chat.find({ participants: userId })
//       .populate('participants', 'name email profilePicture role')
//       .sort({ lastMessage: -1 });
    
//     // Format chat data for response
//     const formattedChats = chats.map(chat => {
//       const otherParticipants = chat.participants.filter(
//         p => p._id.toString() !== userId
//       );
      
//       return {
//         id: chat._id,
//         isGroupChat: chat.isGroupChat,
//         name: chat.isGroupChat 
//           ? chat.groupName 
//           : otherParticipants.length > 0 
//             ? otherParticipants[0].name 
//             : 'Chat',
//         participants: chat.participants,
//         lastMessageDate: chat.lastMessage,
//         unreadCount: chat.messages.filter(
//           m => m.sender.toString() !== userId && !m.readBy.includes(userId)
//         ).length
//       };
//     });
    
//     res.json(formattedChats);
//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get chat messages
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const chatId = req.params.id;
    
//     // Find the chat
//     const chat = await Chat.findById(chatId)
//       .populate('participants', 'name email profilePicture role')
//       .populate('messages.sender', 'name profilePicture role');
    
//     if (!chat) {
//       return res.status(404).json({ message: 'Chat not found' });
//     }
    
//     // Check if user is a participant
//     if (!chat.participants.some(p => p._id.toString() === userId)) {
//       return res.status(403).json({ message: 'Not authorized to view this chat' });
//     }
    
//     // Mark messages as read
//     chat.messages.forEach(message => {
//       if (message.sender._id.toString() !== userId && !message.readBy.includes(userId)) {
//         message.readBy.push(userId);
//       }
//     });
    
//     await chat.save();
    
//     res.json({
//       id: chat._id,
//       isGroupChat: chat.isGroupChat,
//       name: chat.isGroupChat ? chat.groupName : null,
//       participants: chat.participants,
//       messages: chat.messages
//     });
//   } catch (error) {
//     console.error('Error fetching chat:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create new chat or get existing
// router.post('/', auth, async (req, res) => {
//   try {
//     const { participants, isGroup, groupName } = req.body;
//     const userId = req.user.userId;
    
//     // Ensure current user is included in participants
//     const allParticipants = [...new Set([userId, ...participants])];
    
//     // For non-group chats, check if chat already exists between these users
//     if (!isGroup && participants.length === 1) {
//       const existingChat = await Chat.findOne({
//         isGroupChat: false,
//         participants: { $all: allParticipants, $size: allParticipants.length }
//       }).populate('participants', 'name email profilePicture role');
      
//       if (existingChat) {
//         return res.json({
//           id: existingChat._id,
//           isGroupChat: existingChat.isGroupChat,
//           participants: existingChat.participants,
//           messages: existingChat.messages
//         });
//       }
//     }
    
//     // Create new chat
//     const newChat = new Chat({
//       participants: allParticipants,
//       isGroupChat: isGroup || false,
//       groupName: isGroup ? groupName : null,
//       messages: []
//     });
    
//     await newChat.save();
    
//     // Get populated chat
//     const populatedChat = await Chat.findById(newChat._id)
//       .populate('participants', 'name email profilePicture role');
    
//     res.status(201).json({
//       id: populatedChat._id,
//       isGroupChat: populatedChat.isGroupChat,
//       name: populatedChat.isGroupChat ? populatedChat.groupName : null,
//       participants: populatedChat.participants,
//       messages: populatedChat.messages
//     });
//   } catch (error) {
//     console.error('Error creating chat:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Send message
// router.post('/:id/messages', auth, async (req, res) => {
//   try {
//     const { content } = req.body;
//     const userId = req.user.userId;
//     const chatId = req.params.id;
    
//     // Find the chat
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ message: 'Chat not found' });
//     }
    
//     // Check if user is a participant
//     if (!chat.participants.includes(userId)) {
//       return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
//     }
    
//     // Add message
//     chat.messages.push({
//       sender: userId,
//       content,
//       readBy: [userId]
//     });
    
//     chat.lastMessage = new Date();
//     await chat.save();
    
//     // Get the populated message
//     const populatedChat = await Chat.findById(chatId)
//       .populate('messages.sender', 'name profilePicture role');
    
//     const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get available users to chat with
// router.get('/users/available', auth, async (req, res) => {
//   try {
//     const userId = req.user.userId;
    
//     // Find users excluding the current user
//     const users = await User.find({ _id: { $ne: userId } })
//       .select('name email profilePicture role')
//       .sort({ name: 1 });
    
//     res.json(users);
//   } catch (error) {
//     console.error('Error fetching available users:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
