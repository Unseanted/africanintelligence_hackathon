const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentVersionSchema = new Schema({
  content: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  versionNumber: { type: Number, required: true },
  fullContent: { type: String, required: true },
  contributor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending_review", "approved", "needs_revision", "rejected"],
    default: "pending_review",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContentVersion", contentVersionSchema);
