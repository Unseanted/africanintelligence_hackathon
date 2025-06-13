const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const Event = require("../models/Event");

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - date
 *         - deadline
 *         - guidelines
 *         - location
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the event
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: The description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of the event
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: The registration deadline for the event
 *         guidelines:
 *           type: string
 *           description: The guidelines for the event
 *         media:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of media URLs related to the event
 *         location:
 *           type: string
 *           description: The location of the event
 *         category:
 *           type: string
 *           description: The category of the event
 *         mentorship:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of mentorship opportunities
 *         prizes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of prizes for the event
 *         duration:
 *           type: string
 *           description: The duration of the event
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs participating in the event
 *         teams:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the team
 *               description:
 *                 type: string
 *                 description: The description of the team
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs in the team
 *               leader:
 *                 type: string
 *                 description: The user ID of the team leader
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the event was last updated
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  auth,
  roleAuth(["student", "facilitator"]),
  async (req, res) => {
    try {
      const { category, status } = req.query;
      const query = {};

      if (category) query.category = category;
      if (status) query.status = status;

      const events = await Event.find(query)
        .populate("participants", "name email")
        .populate("teams.members", "name email")
        .populate("teams.leader", "name email")
        .sort({ date: 1 });

      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  auth,
  roleAuth(["student", "facilitator"]),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate("participants", "name email")
        .populate("teams.members", "name email")
        .populate("teams.leader", "name email");

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/{id}/register:
 *   post:
 *     summary: Register for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Successfully registered for event
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:id/register", auth, roleAuth(["student"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: "Successfully registered for event" });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/{id}/teams:
 *   post:
 *     summary: Create a team for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:id/teams", auth, roleAuth(["student"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const team = {
      title: req.body.title,
      description: req.body.description,
      leader: req.user._id,
      members: [req.user._id],
    };

    event.teams.push(team);
    await event.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
