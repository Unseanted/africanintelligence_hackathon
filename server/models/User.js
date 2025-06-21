const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const studentSchema = require("./Student");
// const adminSchema = require("./Admin");
// const facilitatorSchema = require("./Facilitator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "facilitator", "student"],
    default: "student",
  },
  roleData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  profilePicture: {
    type: String,
    default: "",
  },
  badges: [
    {
      type: String,
      default: "",
    },
  ], // ["1 day streak", "5 courses completed"]
  bio: {
    type: String,
    default: "",
  },
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// api/student/badges
// Post api/badges

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }

  if (this.isNew) {
    switch (this.role) {
      case "admin":
        this.roleData = await mongoose
          .model("Admin", adminSchema)
          .create({ user: this._id });
        break;
      case "learner":
        this.roleData = await mongoose
          .model("Student", studentSchema)
          .create({ user: this._id });
        break;
      case "facilitator":
        this.roleData = await facilitatorSchema.create({ user: this._id });
    }
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
