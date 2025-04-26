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
export { allCourses };
