import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";

// Generate access and refresh tokens for an admin
const generateTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new Error("Admin not found");

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error generating authentication tokens");
  }
};

// Register a new admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { adminID, adminName, email, password } = req.body;

  // Validate required fields
  if (
    [adminID, adminName, email, password].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All fields (adminID, adminName, email, password) are required"
    );
  }

  // Avatar upload
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar image is required");

  // Check existing admin by ID or email
  const exists = await Admin.findOne({ $or: [{ adminID }, { email }] });
  if (exists) {
    fs.unlinkSync(avatarPath);
    throw new ApiError(409, "Admin with this ID or email already exists");
  }

  // Upload avatar to Cloudinary
  const uploaded = await uploadOnCloudinary(avatarPath);
  if (!uploaded?.url)
    throw new ApiError(500, "Failed to upload avatar, please try again");

  // Create admin record
  const newAdmin = await Admin.create({
    adminID,
    adminName,
    email,
    password,
    avatar: uploaded.url,
  });

  // Remove sensitive fields
  const output = await Admin.findById(newAdmin._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, output, "Admin registered successfully"));
});

// Login an admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { adminID, email, password } = req.body;
  if ((!adminID && !email) || !password)
    throw new ApiError(400, "adminID or email and password are required");

  const admin = await Admin.findOne({ $or: [{ adminID }, { email }] });
  if (!admin) throw new ApiError(404, "Admin not found");

  const valid = await admin.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(admin._id);

  // Set cookies
  const cookieOpts = { httpOnly: true, secure: true };
  res.cookie("accessToken", accessToken, cookieOpts);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: 230 * 24 * 60 * 60 * 1000,
  });

  const safeAdmin = await Admin.findById(admin._id).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: safeAdmin, accessToken, refreshToken },
        "Login successful"
      )
    );
});

// Logout an admin
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const cookieOpts = { httpOnly: true, secure: true };
  return res
    .clearCookie("accessToken", cookieOpts)
    .clearCookie("refreshToken", cookieOpts)
    .status(200)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// Refresh admin access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;
  if (!incoming) throw new ApiError(401, "Unauthenticated request");
  try {
    const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decoded._id);
    if (!admin || incoming !== admin.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(admin._id);
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

// Get current authenticated admin
const getCurrentAdmin = asyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.admin, "Current admin fetched"));
});

// Check if refresh token exists
const checkRefreshToken = asyncHandler((req, res) => {
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;
  return res.status(200).json({ hasToken: Boolean(incoming) });
});

// Get admin by ID or adminName
const getAdmin = asyncHandler(async (req, res) => {
  const { adminID, adminName } = req.params;
  const filter = adminID
    ? { adminID: adminID.trim() }
    : { adminName: adminName?.trim() };
  const admin = await Admin.findOne(filter);
  if (!admin) throw new ApiError(404, "Admin not found");
  return res.status(200).json(new ApiResponse(200, admin, "Admin found"));
});

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  getCurrentAdmin,
  checkRefreshToken,
  getAdmin,
};
