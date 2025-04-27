import { RoomServiceClient, AccessToken } from "livekit-server-sdk";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/videos.model.js";
const createRoom = asyncHandler(async (req, res) => {
  const { url, courseID } = req.body;
  const tutor = req.tutor;
  if (!tutor) throw new ApiError(404, "Could not process the request ");
  const video = new Video({
    url: url,
    tutor: tutor._id,
    courseID,
  });
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video link created"));
});

export { createRoom };
