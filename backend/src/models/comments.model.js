import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const commentSchema = new Schema({
  comment: {
    type: String,
    required: [true, "Cannot generate empty comment"],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
});

export const Comment = mongoose.model("Comment", commentSchema);
