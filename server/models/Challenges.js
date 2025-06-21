const mongoose = require("mongoose");
const student = require("./Student");

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  points: {
    type: Number,
    default: 1000,
    required: true,
    min: [0, "Points cannot be negative"],
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  submissionFormat: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  duration: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

challengeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

challengeSchema.static.getParticipants = async function (challengeId) {
  const challenge = await this.findById(challengeId).populate("participants");
  const students = student.find({
    _id: { $in: challenge.participants.map((participant) => participant._id) },}).populate("student", "user");
  const participants = user.find({
    _id: { $in: students.map((student) => student.user._id)}});
  return participants ;
}

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
