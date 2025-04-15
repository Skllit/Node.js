// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const User = require('./models/User');
const Group = require('./models/Group');
const Message = require('./models/Message');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// ----- REST API Endpoints ----- //

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).populate('groups', 'name');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new group
app.post('/groups', async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all groups
app.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find({}).populate('members', 'name email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a group (add user to group and vice versa)
app.post('/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group || !user) {
      return res.status(404).json({ message: 'Group or User not found.' });
    }

    // Avoid duplicate membership
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
      await user.save();
    }

    res.status(200).json({ message: "User joined the group successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a specific group
app.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a message to a group (REST endpoint)
app.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { sender, content } = req.body;

    // Verify user and group exist
    const group = await Group.findById(groupId);
    const user = await User.findById(sender);
    if (!group || !user) {
      return res.status(404).json({ message: 'Group or User not found.' });
    }

    const message = await Message.create({ group: groupId, sender, content });
    // Emit realtime event after saving message
    io.emit('newMessage', message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----- MongoDB Connection & Server Start ----- //

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/realtime-chatgroups', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// ----- Socket.io Setup ----- //
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for new messages sent via realtime channel
  socket.on('sendMessage', async (data) => {
    try {
      // Expected payload: { groupId, sender, content }
      const { groupId, sender, content } = data;
      const group = await Group.findById(groupId);
      const user = await User.findById(sender);
      if (!group || !user) return;

      const message = await Message.create({ group: groupId, sender, content });
      // Broadcast the message to all clients
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
