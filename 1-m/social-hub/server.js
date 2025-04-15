// server.js

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Group = require('./models/Group');

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static client files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// *******************************
// REST ENDPOINTS
// *******************************

// ---------- USERS ---------- //

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
    const users = await User.find({}).populate('groups').populate('likedPosts');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- GROUPS ---------- //

// Create a new group
app.post('/groups', async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User joins a group (many-to-many update both sides)
app.post('/groups/:groupId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    const user = await User.findById(userId);
    if (!group || !user) {
      return res.status(404).json({ message: 'Group or User not found' });
    }
    // Add user to group if not already there
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    // Add group to user's groups if not already present
    if (!user.groups.includes(group._id)) {
      user.groups.push(group._id);
      await user.save();
    }
    res.status(200).json({ message: 'User joined the group', group, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all groups
app.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find({}).populate('members');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- POSTS ---------- //

// Create a new post; optional: assign a group if provided
app.post('/posts', async (req, res) => {
  try {
    const { content, author, group } = req.body;
    // Validate author exists
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ message: 'Author not found' });
    }
    // If group is provided, validate existence
    if (group) {
      const grp = await Group.findById(group);
      if (!grp) {
        return res.status(404).json({ message: 'Group not found' });
      }
    }
    const post = await Post.create({ content, author, group });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User likes a post (many-to-many: update both Post and User)
app.post('/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);
    const user = await User.findById(userId);
    if (!post || !user) {
      return res.status(404).json({ message: 'Post or User not found' });
    }
    // Check if user already liked the post
    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      await post.save();
    }
    if (!user.likedPosts.includes(post._id)) {
      user.likedPosts.push(post._id);
      await user.save();
    }
    res.status(200).json({ message: 'Post liked', post, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all posts (optionally populate author and likes)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'username email')
      .populate('likedBy', 'username')
      .populate('group', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- COMMENTS ---------- //

// Create a comment for a post
app.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { text, author } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Validate user exists
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const comment = await Comment.create({ text, post: post._id, author });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// *******************************
// REAL-TIME SETUP WITH SOCKET.IO
// *******************************

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/socialhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

// Start the server
const server = app.listen(3000, () => {
  console.log('Social Hub server is running on port 3000');
});

// Set up Socket.io for real-time events
const io = require('socket.io')(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Real-time: broadcast new post
  socket.on('newPost', async (data) => {
    try {
      const { content, author, group } = data;
      // Validate author (and group if provided) as in REST endpoint
      const user = await User.findById(author);
      if (!user) return;
      if (group) {
        const grp = await Group.findById(group);
        if (!grp) return;
      }
      const post = await Post.create({ content, author, group });
      io.emit('postCreated', post);
    } catch (error) {
      console.error('Error creating post in real-time:', error.message);
    }
  });

  // Real-time: broadcast new comment on a post
  socket.on('newComment', async (data) => {
    try {
      const { text, postId, author } = data;
      const post = await Post.findById(postId);
      const user = await User.findById(author);
      if (!post || !user) return;
      const comment = await Comment.create({ text, post: postId, author });
      io.emit('commentAdded', comment);
    } catch (error) {
      console.error('Error adding comment in real-time:', error.message);
    }
  });

  // Real-time: a user joining a group
  socket.on('joinGroup', async (data) => {
    try {
      const { groupId, userId } = data;
      const group = await Group.findById(groupId);
      const user = await User.findById(userId);
      if (!group || !user) return;
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
      }
      if (!user.groups.includes(group._id)) {
        user.groups.push(group._id);
        await user.save();
      }
      io.emit('groupUpdated', group);
    } catch (error) {
      console.error('Error joining group in real-time:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
