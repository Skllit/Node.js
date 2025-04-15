// server.js

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const BlogPost = require('./models/BlogPost');
const Comment = require('./models/Comment');

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static client files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// REST endpoint to create a blog post
app.post('/blogposts', async (req, res) => {
  try {
    const blogPost = await BlogPost.create(req.body);
    res.status(201).json(blogPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REST endpoint to get all blog posts
app.get('/blogposts', async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.status(200).json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REST endpoint to create a comment for a specific blog post
app.post('/blogposts/:id/comments', async (req, res) => {
  try {
    const blogPostId = req.params.id;
    // Verify the blog post exists
    const blogPost = await BlogPost.findById(blogPostId);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    const commentData = { ...req.body, blogPost: blogPostId };
    const comment = await Comment.create(commentData);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REST endpoint to get comments for a specific blog post
app.get('/blogposts/:id/comments', async (req, res) => {
  try {
    const blogPostId = req.params.id;
    const comments = await Comment.find({ blogPost: blogPostId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/realtime-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB: ', error.message);
  });

// Start the server
const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Set up Socket.io for real-time communication
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('New client connected: ', socket.id);

  // Listen for realtime new comment events from clients
  socket.on('newComment', async (data) => {
    try {
      // Expected data: { blogPostId, username, text }
      const { blogPostId, username, text } = data;
      // Verify blog post exists
      const blogPost = await BlogPost.findById(blogPostId);
      if (!blogPost) {
        return;
      }
      // Create the comment in the database
      const comment = await Comment.create({
        blogPost: blogPostId,
        username,
        text
      });
      // Emit the new comment to all connected clients
      io.emit('commentPosted', comment);
    } catch (error) {
      console.error('Error creating comment: ', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected: ', socket.id);
  });
});
