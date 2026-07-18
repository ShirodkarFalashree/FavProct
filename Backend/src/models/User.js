import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be longer than 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student"
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    profilePicture: {
      type: String,
      default: ""
    },

    subject: {
      type: String,
      default: ""
    },

    subjects: {
      type: [String],
      default: []
    },

    cohort: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
      organizationId: this.organizationId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

export default mongoose.model("User", userSchema);
