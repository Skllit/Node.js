// models/Post.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"]
    },
    // One-to-many: author field (one user creates many posts)
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Optional: if a post is posted in a group
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null
    },
    // Many-to-many: users who liked this post
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
