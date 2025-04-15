// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }
}, { _id: false });

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true
    },
    profile: profileSchema,
    // Many-to-many: groups user joined
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    // Many-to-many: posts user liked
    likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
