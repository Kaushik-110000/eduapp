import { Video } from "../models/videos.model.js";

export const getVideosByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const videos = await Video.find({ courseID: courseId })
      .populate('tutor', 'name email')
      .sort({ startTime: -1 });

    if (!videos || videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No videos found for this course",
      });
    }

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching videos",
      error: error.message,
    });
  }
}; 