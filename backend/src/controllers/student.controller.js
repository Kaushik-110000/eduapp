import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import Razorpay from "razorpay";
import { Course } from "../models/course.model.js";
import { Payment } from "../models/payment.model.js";
// Generate access and refresh tokens for a student
const generateTokens = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    const accessToken = student.generateAccessToken();
    const refreshToken = student.generateRefreshToken();

    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error generating authentication tokens");
  }
};

// Register a new student
const registerStudent = asyncHandler(async (req, res) => {
  console.log(req);

  const { studentID, studentName, email, password, interests = [] } = req.body;

  // Validate required fields
  console.log(req.body);
  if (
    [studentID, studentName, email, password].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All fields (studentID, studentName, email, password) are required"
    );
  }

  // Avatar upload
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Check existing student by ID or email
  const exists = await Student.findOne({
    $or: [{ studentID }, { email }],
  });
  if (exists) {
    fs.unlinkSync(avatarPath);
    throw new ApiError(409, "Student with this ID or email already exists");
  }

  // Upload avatar to Cloudinary
  const uploaded = await uploadOnCloudinary(avatarPath);
  if (!uploaded?.url) {
    throw new ApiError(500, "Failed to upload avatar, please try again");
  }

  // Create student record
  const newStudent = await Student.create({
    studentID,
    studentName,
    email,
    password,
    avatar: uploaded.url,
    interests,
  });

  // Remove sensitive fields
  const output = await Student.findById(newStudent._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, output, "Student registered successfully"));
});

// Login a student
const loginStudent = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { studentID, email, password } = req.body;
  if ((!studentID && !email) || !password) {
    throw new ApiError(400, "StudentID or email and password are required");
  }

  const student = await Student.findOne({
    $or: [{ studentID }, { email }],
  });
  if (!student) throw new ApiError(404, "Student not found");

  const valid = await student.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(student._id);

  // Set cookies
  const cookieOpts = { httpOnly: true, secure: true };
  res.cookie("accessToken", accessToken, cookieOpts);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: 230 * 24 * 60 * 60 * 1000,
  });
  res.cookie("userType", "student", {
    ...cookieOpts,
    maxAge: 230 * 24 * 60 * 60 * 1000,
  });
  const safeStudent = await Student.findById(student._id).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { student: safeStudent, accessToken, refreshToken },
        "Login successful"
      )
    );
});

// Logout a student
const logoutStudent = asyncHandler(async (req, res) => {
  await Student.findByIdAndUpdate(
    req.student._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const cookieOpts = { httpOnly: true, secure: true };
  return res
    .clearCookie("accessToken", cookieOpts)
    .clearCookie("refreshToken", cookieOpts)
    .clearCookie("userType", cookieOpts)
    .status(200)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log("hi");
  const incoming = req.cookies?.refreshToken;

  console.log(req.cookies);
  console.log(incoming);

  if (!incoming) throw new ApiError(401, "Unauthenticated request");
  console.log(incoming);
  try {
    const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    console.log(decoded);
    const student = await Student.findById(decoded._id);
    if (!student || incoming !== student.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(student._id);
    const cookieOpts = { httpOnly: true, secure: true };

    res.cookie("accessToken", accessToken, cookieOpts);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOpts,
      maxAge: 230 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed")
      );
  } catch (err) {
    throw new ApiError(401, err.message || "Unauthorized");
  }
});

// Get current authenticated student
const getCurrentStudent = asyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.student, "Current student fetched"));
});

// Check if refresh token exists
const checkRefreshToken = asyncHandler((req, res) => {
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;
  return res.status(200).json({ hasToken: Boolean(incoming) });
});

// Get student by ID or studentName
const getStudent = asyncHandler(async (req, res) => {
  console.log("hello");
  const { studentID, studentName } = req.params;
  const filter = studentID
    ? { _id: studentID.trim() }
    : { studentName: studentName?.trim() };
  const student = await Student.findOne(filter).select("-password");
  if (!student) throw new ApiError(404, "Student not found");

  return res.status(200).json(new ApiResponse(200, student, "Student found"));
});

const enrollCourse = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
    courseID,
  } = await req.body;

  // Find student and course
  const student = await Student.findOne({ email });
  if (!student) throw new ApiError(404, "Student not found");
  
  const course = await Course.findOne({ _id: courseID });
  if (!course) throw new ApiError(404, "Course not found");

  // Check if already enrolled
  if (student.coursesSubscribed.includes(courseID)) {
    throw new ApiError(400, "Student is already enrolled in this course");
  }

  // Create payment record
  const enrollment = new Payment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    student_ID: student._id,
    course_ID: courseID,
  });

  // Update student and course documents
  student.coursesSubscribed.push(courseID);
  course.studentsEnrolled.push(student._id);

  // Save all changes in a transaction
  try {
    await Promise.all([
      student.save(),
      course.save(),
      enrollment.save()
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        student: await Student.findById(student._id).select("-password"),
        course: course
      }, "Course enrolled successfully")
    );
  } catch (error) {
    console.error("Error in enrollment:", error);
    throw new ApiError(500, "Failed to complete enrollment");
  }
});

const generatePaymentOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const { student } = req;
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  const course = await Course.findOne({ _id: courseId.trim() });
  if (!course) throw new ApiError(404, "Course not found");
  const amount = course?.coursePrice;
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_order_" + Math.floor(Math.random() * 1000000),
  };
  const order = await instance.orders.create(options);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order successfully generated"));
});
export {
  registerStudent,
  loginStudent,
  logoutStudent,
  refreshAccessToken,
  getCurrentStudent,
  checkRefreshToken,
  getStudent,
  generatePaymentOrder,
  enrollCourse,
};
