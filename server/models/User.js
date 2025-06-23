const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./Student");
// const Admin = require("./Admin");
// const Facilitator = require("./Facilitator");
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
    type: mongoose.Schema.Types.ObjectId,
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
  authProvider: {
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
});

userSchema.post("save", async function () {
  try {
    if (!this.roleData) {
      let roleData;
      switch (this.role) {
        case "admin":
          // roleData = await Admin.create({ user: this._id });
          break;
        case "student":
          roleData = await Student.create({ user: this._id });
          break;
        case "facilitator":
          // roleData = await Facilitator.create({ user: this._id });
          break;
      }

      // Update the user's roleData field if a role document was created
      if (roleData) {
        await User.findByIdAndUpdate(this._id, { roleData: roleData._id });
      }
    }
  } catch (error) {
    console.error("Error in post-save hook:", error);
    throw error; // Re-throw to ensure the error is handled by Mongoose
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
