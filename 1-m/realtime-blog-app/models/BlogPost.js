// models/BlogPost.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title"]
    },
    content: {
      type: String,
      required: [true, "Please enter the blog content"]
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
