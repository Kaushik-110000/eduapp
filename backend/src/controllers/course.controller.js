import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
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
export { allCourses, getCourse };
