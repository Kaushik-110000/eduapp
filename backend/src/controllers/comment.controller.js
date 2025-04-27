import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/videos.model.js";
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


const giveReviewOnVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) throw new ApiError(404, "Course Id is missing");
  const videos = await Video.find({ courseID: courseId }).lean();
  const videoIds = videos.map((v) => v._id);
  const comments = await Comment.find({ videoId: { $in: videoIds } })
    .select("studentId comment videoId")
    .lean();
  const reviewsByVideo = {};
  videos.forEach((video, idx) => {
    const key = `video_${idx + 1}`;
    reviewsByVideo[key] = comments
      .filter((c) => c.videoId.toString() === video._id.toString())
      .map((c) => ({
        user_id: c.studentId.toString(),
        review: c.comment,
      }));
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, reviewsByVideo, "Fetched all videos with reviews")
    );
});

export { createComment, giveReviewOnVideos };

// const getAllVideos = asyncHandler(async (req, res) => {
//   const { courseId } = req.params;
//   if (!courseId) throw new ApiError(404, "COurse Id is missing");
//   const videos = await Video.find({ courseID: courseId });
//   return res
//     .status(200)
//     .json(new ApiResponse(200, videos, "Fetched all videos"));
// });
