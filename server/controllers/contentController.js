const Content = require("../models/Content");
const ContentVersion = require("../models/ContentVersion");
const PullRequest = require("../models/PullRequest");
const Notification = require("../models/Notification");

// Content CRUD
exports.listContent = async (req, res) => {
  try {
    const content = await Content.find({});
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, type, collaborators } = req.body;
    const owner = req.user.id;
    const content = await Content.create({ title, type, owner, collaborators });
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to create content" });
  }
};

// Content Versions
exports.listVersions = async (req, res) => {
  try {
    const { contentId } = req.params;
    const versions = await ContentVersion.find({ content: contentId }).sort({
      versionNumber: -1,
    });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch versions" });
  }
};

exports.createVersion = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { fullContent } = req.body;
    const contributor = req.user.id;
    const lastVersion = await ContentVersion.findOne({
      content: contentId,
    }).sort({ versionNumber: -1 });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    const version = await ContentVersion.create({
      content: contentId,
      versionNumber,
      fullContent,
      contributor,
    });
    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ error: "Failed to create version" });
  }
};

exports.updateVersion = async (req, res) => {
  try {
    const { contentId, versionId } = req.params;
    const { fullContent, status } = req.body;
    const version = await ContentVersion.findOneAndUpdate(
      { _id: versionId, content: contentId },
      { fullContent, status },
      { new: true }
    );
    res.json(version);
  } catch (err) {
    res.status(500).json({ error: "Failed to update version" });
  }
};

// Pull Requests
exports.listPRs = async (req, res) => {
  try {
    const { contentId } = req.params;
    const prs = await PullRequest.find({ content: contentId });
    res.json(prs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
};

exports.createPR = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { sourceVersion, targetVersion, reviewers } = req.body;
    const author = req.user.id;
    const pr = await PullRequest.create({
      content: contentId,
      sourceVersion,
      targetVersion,
      author,
      reviewers,
    });
    res.status(201).json(pr);
  } catch (err) {
    res.status(500).json({ error: "Failed to create pull request" });
  }
};

exports.updatePR = async (req, res) => {
  try {
    const { prId } = req.params;
    const { status } = req.body;
    const pr = await PullRequest.findByIdAndUpdate(
      prId,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(pr);
  } catch (err) {
    res.status(500).json({ error: "Failed to update pull request" });
  }
};

// Notifications
exports.listNotifications = async (req, res) => {
  try {
    const user = req.user.id;
    const notifications = await Notification.find({ user }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const user = req.user.id;
    const { type, content } = req.body;
    const notification = await Notification.create({ user, type, content });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
};
