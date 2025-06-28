const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pullRequestSchema = new Schema({
  content: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  sourceVersion: {
    type: Schema.Types.ObjectId,
    ref: "ContentVersion",
    required: true,
  },
  targetVersion: {
    type: Schema.Types.ObjectId,
    ref: "ContentVersion",
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "needs_revision", "approved", "merged", "rejected"],
    default: "open",
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PullRequest", pullRequestSchema);
