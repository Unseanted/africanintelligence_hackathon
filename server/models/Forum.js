const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ForumPostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [CommentSchema],
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("ForumPost", ForumPostSchema);
