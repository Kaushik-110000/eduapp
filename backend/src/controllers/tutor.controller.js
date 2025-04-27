import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tutor } from "../models/tutor.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { Course } from "../models/course.model.js";
// Generate access and refresh tokens for a tutor
const generateTokens = async (tutorId) => {
  try {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) throw new Error("Tutor not found");

    const accessToken = tutor.generateAccessToken();
    const refreshToken = tutor.generateRefreshToken();

    tutor.refreshToken = refreshToken;
    await tutor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error generating authentication tokens");
  }
};

// Register a new tutor
const registerTutor = asyncHandler(async (req, res) => {
  const { tutorID, tutorName, email, password, description = "" } = req.body;

  // Validate required fields
  if (
    [tutorID, tutorName, email, password].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All fields (tutorID, tutorName, email, password) are required"
    );
  }

  // Avatar upload
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Check existing tutor by ID or email
  const exists = await Tutor.findOne({
    $or: [{ tutorID }, { email }],
  });
  if (exists) {
    fs.unlinkSync(avatarPath);
    throw new ApiError(409, "Tutor with this ID or email already exists");
  }

  // Upload avatar to Cloudinary
  const uploaded = await uploadOnCloudinary(avatarPath);
  if (!uploaded?.url) {
    throw new ApiError(500, "Failed to upload avatar, please try again");
  }

  // Create tutor record
  const newTutor = await Tutor.create({
    tutorID,
    tutorName,
    email,
    password,
    avatar: uploaded.url,
    description,
  });

  // Remove sensitive fields
  const output = await Tutor.findById(newTutor._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, output, "Tutor registered successfully"));
});

// Login a tutor
const loginTutor = asyncHandler(async (req, res) => {
  // console.log(req)
  const { tutorID, email, password } = req.body;
  if ((!tutorID && !email) || !password) {
    throw new ApiError(400, "tutorID or email and password are required");
  }

  const tutor = await Tutor.findOne({
    $or: [{ tutorID }, { email }],
  });
  if (!tutor) throw new ApiError(404, "Tutor not found");

  const valid = await tutor.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(tutor._id);

  // Set cookies
  const cookieOpts = { httpOnly: true, secure: true };
  res.cookie("accessToken", accessToken, cookieOpts);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: 230 * 24 * 60 * 60 * 1000,
  });
  res.cookie("userType", "tutor", {
    ...cookieOpts,
    maxAge: 230 * 24 * 60 * 60 * 1000,
  });
  const safeTutor = await Tutor.findById(tutor._id).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tutor: safeTutor, accessToken, refreshToken },
        "Login successful"
      )
    );
});

// Logout a tutor
const logoutTutor = asyncHandler(async (req, res) => {
  await Tutor.findByIdAndUpdate(
    req.tutor._id,
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
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;
  if (!incoming) throw new ApiError(401, "Unauthenticated request");

  try {
    const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    const tutor = await Tutor.findById(decoded._id);

    if (!tutor || incoming !== tutor.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(tutor._id);
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

// Get current authenticated tutor
const getCurrentTutor = asyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.tutor, "Current tutor fetched"));
});

// Check if refresh token exists
const checkRefreshToken = asyncHandler((req, res) => {
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;
  return res.status(200).json({ hasToken: Boolean(incoming) });
});

// Get tutor by ID or tutorName
const getTutor = asyncHandler(async (req, res) => {
  const { tutorID, tutorName } = req.params;
  const filter = tutorID
    ? { _id: tutorID.trim() }
    : { tutorName: tutorName?.trim() };
  const tutor = await Tutor.findOne(filter).select("-password");
  if (!tutor) throw new ApiError(404, "Tutor not found");

  return res.status(200).json(new ApiResponse(200, tutor, "Tutor found"));
});

const createCourse = asyncHandler(async (req, res) => {
  const { tutor } = req;
  if (!tutor) throw new ApiError(404, "Tutor not found");
  const {
    courseName,
    tutors = [],
    coursePrice,
    courseDescription,
    studentsEnrolled = [],
    tags = [],
  } = req.body;
  console.log("A", tutor);
  const course = await new Course({
    courseName,
    tutors,
    coursePrice,
    courseDescription,
    studentsEnrolled,
    tags,
  });

  await course.save();
  tutor.coursesTaught.push(course._id);

  return res
    .status(200)
    .json(new ApiResponse(200, course, "New course created"));
});

const checkVerification = asyncHandler(async (req, res) => {
  const { tutorID } = req.params;
  const tutor = await Tutor.findOne({ _id: tutorID });
  if (!tutor) throw new ApiError(404, "Not found tutor");
  if (tutor.isPending == true) throw new ApiError(405, "Tutor is not verified");
  return res.status(200).json(new ApiResponse(200, {}, "Tutor is verified"));
});

export {
  registerTutor,
  loginTutor,
  logoutTutor,
  refreshAccessToken,
  getCurrentTutor,
  checkRefreshToken,
  getTutor,
  createCourse,
  checkVerification,
};
