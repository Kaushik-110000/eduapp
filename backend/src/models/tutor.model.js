import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const tutorSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tutorID: {
      type: String,
      required: true,
      unique: true,
    },
    tutorName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isPending: {
      type: Boolean,
      default: true,
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
    description: {
      type: String,
    },
    coursesTaught: [
      {
        type: mongoose.Schema.Types.ObjectId, // ✅ assuming course IDs are stored
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
tutorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
tutorSchema.methods.isPasswordCorrect = async function (tpassword) {
  return await bcrypt.compare(tpassword, this.password);
};

// Method to generate Access Token
tutorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      tutorName: this.tutorName, // ✅ Corrected - no fullName or userName in schema
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate Refresh Token
tutorSchema.methods.generateRefreshToken = function () {
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

export const Tutor = mongoose.model("Tutor", tutorSchema);
