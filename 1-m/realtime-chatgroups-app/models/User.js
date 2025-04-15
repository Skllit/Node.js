// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "User name required"] },
    email: { type: String, required: [true, "User email required"], unique: true },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
