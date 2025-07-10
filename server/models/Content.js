const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContentVersion = require("./ContentVersion");

const contentSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["quiz", "article", "lesson"], required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: "User", }],
  latestVersion: { type: Schema.Types.ObjectId, ref: "ContentVersion" },
  versions: [{ type: Schema.Types.ObjectId, ref: "ContentVersion" }],
  visible: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Content", contentSchema);
