const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { Event, Team } = require("../models/Event");

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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the prize
 *               category:
 *                 type: string
 *                 enum: [cash, experience, recognition, resources, opportunity, other]
 *                 description: The category of the prize
 *               value:
 *                 type: string
 *                 description: The value of the prize (e.g., "$500", "Free Course")
 *               description:
 *                 type: string
 *                 description: Detailed description of what the prize includes
 *               eligibility:
 *                 type: string
 *                 description: Eligibility requirements for the prize
 *               rank:
 *                 type: number
 *                 description: The ranking/position of the prize (1st, 2nd, 3rd, etc.)
 *           description: Array of detailed prize objects for the event
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
 *           enum: [upcoming, ongoing, completed]
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

      // Update status for each event and add capacity information
      const eventsWithCapacity = events.map((event) => {
        const oldStatus = event.status;
        event.updateStatus();

        // Save if status changed
        if (oldStatus !== event.status) {
          event
            .save()
            .catch((err) => console.error("Error saving updated status:", err));
        }

        const eventObj = event.toObject();
        eventObj.remainingCapacity = event.getRemainingCapacity();
        eventObj.isRegistrationOpen = event.isRegistrationOpen();
        eventObj.hasCapacity = event.hasCapacity();

        return eventObj;
      });

      res.json(eventsWithCapacity);
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

      // Update status and add capacity information
      const oldStatus = event.status;
      event.updateStatus();

      // Save if status changed
      if (oldStatus !== event.status) {
        await event.save();
      }

      const eventObj = event.toObject();
      eventObj.remainingCapacity = event.getRemainingCapacity();
      eventObj.isRegistrationOpen = event.isRegistrationOpen();
      eventObj.hasCapacity = event.hasCapacity();

      res.json(eventObj);
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date of the event
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: The registration deadline for the event
 *               guidelines:
 *                 type: string
 *                 description: The guidelines for the event
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of media URLs related to the event
 *               location:
 *                 type: string
 *                 description: The location of the event
 *               category:
 *                 type: string
 *                 description: The category of the event
 *               mentorship:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of mentorship opportunities
 *               prizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prizes for the event
 *               duration:
 *                 type: string
 *                 description: The duration of the event
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date of the event
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: The registration deadline for the event
 *               guidelines:
 *                 type: string
 *                 description: The guidelines for the event
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of media URLs related to the event
 *               location:
 *                 type: string
 *                 description: The location of the event
 *               category:
 *                 type: string
 *                 description: The category of the event
 *               mentorship:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of mentorship opportunities
 *               prizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prizes for the event
 *               duration:
 *                 type: string
 *                 description: The duration of the event
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
 *       400:
 *         description: Already registered for this event, registration deadline passed, or event at capacity
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

    // Check if user is already registered
    if (event.participants.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // Check if registration deadline has passed
    if (!event.isRegistrationOpen()) {
      return res
        .status(400)
        .json({ message: "Registration deadline has passed" });
    }

    // Check if event has capacity
    if (!event.hasCapacity()) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    event.participants.push(req.user.userId);
    await event.save();

    res.json({
      message: "Successfully registered for event",
      remainingCapacity: event.getRemainingCapacity(),
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/{id}/leave:
 *   delete:
 *     summary: Leave an event
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
 *         description: Successfully left the event
 *       400:
 *         description: Not registered for this event
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id/leave", auth, roleAuth(["student"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const participantIndex = event.participants.indexOf(req.user.userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    // Remove user from participants
    event.participants.splice(participantIndex, 1);

    // Remove user from any teams they're part of
    event.teams = event.teams
      .map((team) => {
        const memberIndex = team.members.indexOf(req.user.userId);
        if (memberIndex !== -1) {
          team.members.splice(memberIndex, 1);
        }
        return team;
      })
      .filter((team) => team.members.length > 0); // Remove empty teams

    await event.save();

    res.json({
      message: "Successfully left the event",
      remainingCapacity: event.getRemainingCapacity(),
    });
  } catch (error) {
    console.error("Error leaving event:", error);
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
      leader: req.user.userId,
      members: [req.user.userId],
    };

    event.teams.push(await Team.create(team));
    await event.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /events/sample:
 *   post:
 *     summary: Create a sample event with detailed prizes (for testing)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sample event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/sample", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const sampleEvent = new Event({
      title: "Tech Innovation Hackathon 2024",
      description:
        "Join us for an exciting 48-hour hackathon where you'll build innovative solutions using cutting-edge technologies. Work with talented developers, designers, and entrepreneurs to create something amazing!",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      guidelines: `
        <h1>Hackathon Guidelines</h1>
        <h2>General Rules</h2>
        <ul>
          <li>Teams must consist of 2-4 members</li>
          <li>All code must be written during the hackathon</li>
          <li>Use of open-source libraries is allowed</li>
        </ul>
        <h2>Submission Requirements</h2>
        <ul>
          <li>Working prototype or demo</li>
          <li>GitHub repository with source code</li>
          <li>5-minute presentation</li>
        </ul>
        <h2>Judging Criteria</h2>
        <ul>
          <li>Innovation and creativity (30%)</li>
          <li>Technical implementation (25%)</li>
          <li>User experience (20%)</li>
          <li>Market potential (15%)</li>
          <li>Presentation (10%)</li>
        </ul>
      `,
      location: "Tech Hub Campus, Building A",
      category: "hackathon",
      duration: "48 hours",
      capacity: 100,
      prizes: [
        {
          title: "Grand Prize",
          category: "cash",
          value: "$5,000",
          description:
            "Cash prize for the winning team. Can be used for further development, business expenses, or team celebration.",
          eligibility: "Open to all registered teams",
          rank: 1,
        },
        {
          title: "Internship Opportunity",
          category: "opportunity",
          value: "3-Month Paid Internship",
          description:
            "Fast-track internship opportunity at leading tech companies. Includes mentorship, real project experience, and potential full-time offers.",
          eligibility: "Students and recent graduates only",
          rank: 2,
        },
        {
          title: "Premium Course Bundle",
          category: "resources",
          value: "Worth $2,000",
          description:
            "Complete access to premium online courses in AI, Machine Learning, and Full-Stack Development. Includes certificates and lifetime access.",
          eligibility: "Open to all participants",
          rank: 3,
        },
        {
          title: "Industry Recognition",
          category: "recognition",
          value: "Featured on Tech Blog",
          description:
            "Your project will be featured on our partner tech blogs and social media channels. Great for portfolio and networking.",
          eligibility: "Top 10 teams",
          rank: 4,
        },
        {
          title: "Mentorship Program",
          category: "experience",
          value: "6-Month Mentorship",
          description:
            "One-on-one mentorship with industry experts. Includes career guidance, technical advice, and networking opportunities.",
          eligibility: "All participants",
          rank: 5,
        },
      ],
      mentorship: [
        "AI/ML experts from Google",
        "Full-stack developers from Microsoft",
        "UX/UI designers from Apple",
        "Startup founders and investors",
      ],
      media: [
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      ],
    });

    await sampleEvent.save();
    res.status(201).json(sampleEvent);
  } catch (error) {
    console.error("Error creating sample event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
