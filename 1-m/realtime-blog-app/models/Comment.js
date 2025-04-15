// models/Comment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    blogPost: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      required: true
    },
    username: {
      type: String,
      required: [true, "Username is required"]
    },
    text: {
      type: String,
      required: [true, "Comment text is required"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', commentSchema);
