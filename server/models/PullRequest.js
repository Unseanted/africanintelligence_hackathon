const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Content = require("./Content");
const ContentVersion = require("./ContentVersion");

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

pullRequestSchema.pre("save", async () => {
  const contentVersions = await ContentVersion.find({content: this.content}).sort({versionNumber: -1});
  const targetVersion = contentVersions[0];
  this.targetVersion = targetVersion._id;
  // to be completed
});

module.exports = mongoose.model("PullRequest", pullRequestSchema);
