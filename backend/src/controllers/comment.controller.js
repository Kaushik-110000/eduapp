import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";

const createComment = asyncHandler(async (req, res) => {
  const { content, studentId, videoId } = req.body;
  const comment = new Comment({
    content,
    studentId,
    videoId,
  });
  await comment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfully commented"));
});

export { createComment };
