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
    const owner = req.user.userId;
    const content = await Content.create({ title, type, owner, collaborators });
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to create content" });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({error: "Failed to find content"});
    }

    res.status(200).json(content);
  }
  catch (err) {
    res.status(500).json({error: "Failed to create content"});
  }
}

exports.getCollaborators = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    const collaborators = content?.collaborators;
    if (!collaborators) {
      return res.status(404).json("No collaborators found");
    }

    res.status(200).json(collaborators);
  }
  catch (err) {
    res.status(500).json({error: "Failed to get collaborators"})
  }
}

exports.setContentVisibility = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { visible } = req.body

    const content = await Content.findByIdAndUpdate(contentId, {visible}, {new : true});

    if (!content) {
      return res.status(404).json({error: "Failed to find content"})
    }

    res.status(200).json(content);
  }
  catch (err) {
    res.status(500).json({error: "Failed to change content visibility"})
  }
}

exports.addCollaborators = async (req, res) => {
  try {
  const { contentId } = req.params;
  const { collaborators } = req.body;

  if (!Array.isArray(collaborators) || collaborators.length === 0) {
    return res.status(400).json("No collaborators provided");
  }
  console.log(`contentId: ${contentId}`);

  console.log(`collabs: ${collaborators}`);

  const content = await Content.findByIdAndUpdate(contentId, {$push: { collaborators: { $each: collaborators } }}, {new: true});

  console.log(`content: ${content}`);

  if (!content) {
    return res.status(404).json("Failed to find content");
  }

  res.status(202).json(content);
  }
  catch (err) {
    res.status(500).json("Failed to add collaborators");
  }
}

exports.revertVersion = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { versionNumber } = req.body;
    
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json("Failed to find content");
    }

    const contentVersions = [];
    for (let versionId of content.versions) {
      let version = await ContentVersion.findById(versionId);
      contentVersions.push(version);
    }

    const newLatestVersion = contentVersions.find((version) => version.versionNumber === versionNumber);

    if (!newLatestVersion) {
      return res.status(404).json("Version does not exist");
    }

    const revertedVersionList = contentVersions.filter((version) => version.versionNumber <= versionNumber).map((version) => version._id);

    content.versions = revertedVersionList;
    content.latestVersion = newLatestVersion._id;
    await content.save();


    /*
    const newLatestVersion = content.versions.find(async (version) => {const contentVersion = await ContentVersion.findById(version); return contentVersion.versionNumber === versionNumber;});

    if (!newLatestVersion) {
      return res.status(404).json("Version does not exist");
    }

    content.versions = content.versions.filter(async (version) => {const contentVersion = await ContentVersion.findById(version); return contentVersion.versionNumber <= versionNumber;});
    content.latestVersion = newLatestVersion;
    await content.save();
    */

    res.status(200).json(content);

  }
  catch (err) {
    res.status(500).json("Failed to revert version");
  }
}

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
    const { fullContent, message } = req.body;
    const contributor = req.user.userId;
    const currentContent = await Content.findById(contentId);

    if (!currentContent) {
      return res.status(404).json({error: "Failed to find content"});
    }
    const lastVersion = await ContentVersion.findById(currentContent.latestVersion);
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    const version = await ContentVersion.create({
      content: contentId,
      versionNumber,
      fullContent,
      contributor,
      message,
    });
    currentContent.versions.push(version._id);
    currentContent.latestVersion = version._id;
    await currentContent.save();
    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ error: "Failed to create version" });
  }
};


// No need for this route for now
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

// Pull Request endpoints not necessary for now
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
    // const { sourceVersion, targetVersion, reviewers } = req.body;
    const author = req.user.userId;
    const pr = await PullRequest.create({
      content: contentId,
      author,
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
    const user = req.user.userId;
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
    const user = req.user.userId;
    const { type, content } = req.body;
    const notification = await Notification.create({ user, type, content });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
};
