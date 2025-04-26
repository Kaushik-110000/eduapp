import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const paymentSchema = new Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
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
