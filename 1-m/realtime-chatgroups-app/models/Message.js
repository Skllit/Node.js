// models/Message.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: [true, "Message content required"] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
