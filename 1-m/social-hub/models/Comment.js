// models/Comment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"]
    },
    // One-to-many: a post has many comments
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    // Comment author
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', commentSchema);
