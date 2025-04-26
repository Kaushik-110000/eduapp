import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const videosSchema = new Schema({
  url: {
    type: String,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
  },
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

export const Video = mongoose.model("Videos", videosSchema);
