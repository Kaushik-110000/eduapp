import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const studentSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // ✅ should be `lowercase`, not `lowerCase`
      trim: true,
    },
    studentID: {
      type: String,
      required: true,
      unique: true,
    },
    isEnrolled: {
      type: Boolean,
      default: false,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    interests: [String],
    coursesSubscribed: [
      {
        type: mongoose.Schema.Types.ObjectId, // ✅ assuming course IDs are stored
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
studentSchema.methods.isPasswordCorrect = async function (tpassword) {
  return await bcrypt.compare(tpassword, this.password);
};

// Method to generate Access Token
studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      studentName: this.studentName, // ✅ Corrected - no fullName or userName in schema
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate Refresh Token
studentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Student = mongoose.model("Student", studentSchema);
