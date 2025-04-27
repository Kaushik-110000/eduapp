import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { Video } from "../models/videos.model.js";
const allCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();
  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Fetched all courses"));
});

const getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findOne({ _id: courseId });
  if (!course) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, course, "Course found"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) throw new ApiError(404, "COurse Id is missing");
  const videos = await Video.find({ courseID: courseId });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Fetched all videos"));
});
export { allCourses, getCourse, getAllVideos };
