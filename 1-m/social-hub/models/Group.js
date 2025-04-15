// models/Group.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"]
    },
    description: {
      type: String,
      default: ""
    },
    // Many-to-many: list of members
    members: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Group', groupSchema);
