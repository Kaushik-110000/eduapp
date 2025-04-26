import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model.js";
import { Tutor } from "../models/tutor.model.js";
import { Admin } from "../models/admin.model.js";

//used _ instead of res as it was not used anywhere
export const verifyStudent = asyncHandler(async (req, _, next) => {
  // console.log("Entering in verify JWT function");
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    // console.log("Yout token ", token);

    if (!token) throw new ApiError(403, "Unauthorised request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Student.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.student = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export const verifyTutor = asyncHandler(async (req, _, next) => {
  // console.log("Entering in verify JWT function");
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    // console.log("Yout token ", token);

    if (!token) throw new ApiError(403, "Unauthorised request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Tutor.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.tutor = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export const verifyAdmin = asyncHandler(async (req, _, next) => {
  // console.log("Entering in verify JWT function");
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    // console.log("Yout token ", token);

    if (!token) throw new ApiError(403, "Unauthorised request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.admin = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});
