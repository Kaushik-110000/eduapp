import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const videosSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    startTime: {
      type: Number,
      default: () => Date.now(),
    },
    endTime: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Videos", videosSchema);
