const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  validateForumPost,
  validateComment,
} = require("../middleware/validation");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");

/**
 * @swagger
 * components:
 *   schemas:
 *     ForumCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: general
 *         name:
 *           type: string
 *           example: General Discussion
 *         description:
 *           type: string
 *           example: Discuss general topics and ideas
 *     ForumPost:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         title:
 *           type: string
 *           example: Welcome to the Community Forum
 *         content:
 *           type: string
 *           example: This is a place to discuss and share ideas
 *         category:
 *           type: string
 *           example: general
 *         author:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               example: john@example.com
 *         isCommunityPost:
 *           type: boolean
 *           example: true
 *         courseId:
 *           type: string
 *           nullable: true
 *           example: null
 *         image:
 *           type: string
 *           nullable: true
 *           example: /uploads/1234567890-image.jpg
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["507f1f77bcf86cd799439011"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         content:
 *           type: string
 *           example: Great post!
 *         author:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: Jane Doe
 *             email:
 *               type: string
 *               example: jane@example.com
 *         post:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ForumPostInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           example: Welcome to the Community Forum
 *         content:
 *           type: string
 *           example: This is a place to discuss and share ideas
 *         category:
 *           type: string
 *           example: general
 *         isCommunityPost:
 *           type: boolean
 *           example: true
 *         courseId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         image:
 *           type: string
 *           format: binary
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           example: Great post!
 */

/**
 * @swagger
 * tags:
 *   name: Forum
 *   description: Forum management endpoints
 */

/**
 * @swagger
 * /forum/categories:
 *   get:
 *     summary: Get all forum categories
 *     tags: [Forum]
 *     responses:
 *       200:
 *         description: List of forum categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ForumCategory'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /forum/community:
 *   get:
 *     summary: Get community forum posts
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter posts by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of forum posts with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumPost'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /forum:
 *   post:
 *     summary: Create a new forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ForumPostInput'
 *     responses:
 *       201:
 *         description: Forum post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumPost'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /forum/{postId}/comments:
 *   post:
 *     summary: Add a comment to a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the forum post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /forum/{postId}/like:
 *   post:
 *     summary: Toggle like on a forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the forum post
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumPost'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /forum/{postId}:
 *   get:
 *     summary: Get a single forum post by ID
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the forum post
 *     responses:
 *       200:
 *         description: Forum post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumPost'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif) are allowed"));
  },
});

// Get forum categories
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        id: "general",
        name: "General Discussion",
        description: "Discuss general topics and ideas",
      },
      {
        id: "questions",
        name: "Questions & Answers",
        description: "Ask and answer questions about the course or community",
      },
      {
        id: "resources",
        name: "Resources & Links",
        description: "Share helpful resources, links, and materials",
      },
      {
        id: "projects",
        name: "Projects & Collaborations",
        description: "Collaborate on projects and share progress",
      },
      {
        id: "careers",
        name: "Careers & Opportunities",
        description: "Discuss career paths and opportunities in tourism",
      },
      {
        id: "events",
        name: "Events & Meetups",
        description: "Plan and discuss events, meetups, and activities",
      },
      {
        id: "feedback",
        name: "Feedback & Suggestions",
        description: "Provide feedback and suggestions for improvement",
      },
    ];
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get community forum posts (with optional category filter)
router.get("/community", authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isCommunityPost: true };

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const posts = await db.collection("forums").find().toArray();
    // const posts = await db.collection('forums')
    //       .find(query)
    //       .sort({ createdAt: -1 })
    //       .skip(parseInt(skip))
    //       .limit(parseInt(limit))
    //       .toArray();

    // Fetch author and comments for each post
    for (let post of posts) {
      // Fetch author
      const author = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(post.author) },
          { projection: { name: 1, email: 1 } }
        );
      post.author = author || { name: "Unknown", email: null };

      // Fetch comments and their authors
      if (post.comments && post.comments.length > 0) {
        const commentIds = post.comments.map((id) => new ObjectId(id));
        const comments = await db
          .collection("comments")
          .find({ _id: { $in: commentIds } })
          .toArray();

        // Fetch authors for comments
        for (let comment of comments) {
          const commentAuthor = await db
            .collection("users")
            .findOne(
              { _id: new ObjectId(comment.author) },
              { projection: { name: 1, email: 1 } }
            );
          comment.author = commentAuthor || { name: "Unknown", email: null };
        }
        post.comments = comments;
      } else {
        post.comments = [];
      }
    }

    const totalPosts = await db.collection("forums").countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching community forum:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new forum post with optional image upload
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validateForumPost,
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { title, content, category, isCommunityPost } = req.body;

      const post = {
        title,
        content,
        category,
        author: req.user.id,
        isCommunityPost: isCommunityPost || false,
        courseId: isCommunityPost === "true" ? null : req.body.courseId,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        comments: [],
        likes: [],
        createdAt: new Date(),
      };

      const result = await db.collection("forums").insertOne(post);

      const insertedPost = await db
        .collection("forums")
        .findOne({ _id: result.insertedId });

      // Fetch author details
      const author = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(insertedPost.author) },
          { projection: { name: 1, email: 1 } }
        );
      insertedPost.author = author || { name: "Unknown", email: null };

      res.status(201).json(insertedPost);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add a comment to a forum post
router.post(
  "/:postId/comments",
  authMiddleware,
  validateComment,
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { content } = req.body;
      const postId = req.params.postId;

      const post = await db
        .collection("forums")
        .findOne({ _id: new ObjectId(postId) });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = {
        content,
        author: req.user.id,
        post: postId,
        createdAt: new Date(),
      };

      const commentResult = await db.collection("comments").insertOne(comment);

      await db
        .collection("forums")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $push: { comments: commentResult.insertedId.toString() } }
        );

      const insertedComment = await db
        .collection("comments")
        .findOne({ _id: commentResult.insertedId });

      // Fetch author details for the comment
      const commentAuthor = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(insertedComment.author) },
          { projection: { name: 1, email: 1 } }
        );
      insertedComment.author = commentAuthor || {
        name: "Unknown",
        email: null,
      };

      res.status(201).json({ comment: insertedComment });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Toggle like on a forum post
router.post("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const postId = req.params.postId;

    const post = await db
      .collection("forums")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    let likes = post.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      likes = likes.filter((id) => id !== userId);
    } else {
      likes.push(userId);
    }

    await db
      .collection("forums")
      .updateOne({ _id: new ObjectId(postId) }, { $set: { likes } });

    const updatedPost = await db
      .collection("forums")
      .findOne({ _id: new ObjectId(postId) });

    // Fetch author and comments
    const author = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(updatedPost.author) },
        { projection: { name: 1, email: 1 } }
      );
    updatedPost.author = author || { name: "Unknown", email: null };

    if (updatedPost.comments && updatedPost.comments.length > 0) {
      const commentIds = updatedPost.comments.map((id) => new ObjectId(id));
      const comments = await db
        .collection("comments")
        .find({ _id: { $in: commentIds } })
        .toArray();

      for (let comment of comments) {
        const commentAuthor = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(comment.author) },
            { projection: { name: 1, email: 1 } }
          );
        comment.author = commentAuthor || { name: "Unknown", email: null };
      }
      updatedPost.comments = comments;
    } else {
      updatedPost.comments = [];
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single forum post by ID
router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const postId = req.params.postId;

    const post = await db
      .collection("forums")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch author
    const author = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(post.author) },
        { projection: { name: 1, email: 1 } }
      );
    post.author = author || { name: "Unknown", email: null };

    // Fetch comments and their authors
    if (post.comments && post.comments.length > 0) {
      const commentIds = post.comments.map((id) => new ObjectId(id));
      const comments = await db
        .collection("comments")
        .find({ _id: { $in: commentIds } })
        .toArray();

      for (let comment of comments) {
        const commentAuthor = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(comment.author) },
            { projection: { name: 1, email: 1 } }
          );
        comment.author = commentAuthor || { name: "Unknown", email: null };
      }
      post.comments = comments;
    } else {
      post.comments = [];
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
