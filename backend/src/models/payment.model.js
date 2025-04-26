import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const paymentSchema = new Schema({
  order_ID: {
    type: String,
    required: true,
  },
  student_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  course_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

export const Payment = mongoose.model("Payment", paymentSchema);
