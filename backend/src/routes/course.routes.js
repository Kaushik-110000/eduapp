import { Router } from "express";
import {
  allCourses,
  getCourse,
  getAllVideos,
} from "../controllers/course.controller.js";
import { createRoom } from "../controllers/video.controller.js";
import { giveReviewOnVideos } from "../controllers/comment.controller.js";
const router = Router();
import { verifyTutor } from "../middlewares/auth.middleware.js";
router.route("/all").get(allCourses);
router.route("/createVideo").post(verifyTutor, createRoom);
router.route("/:courseId").get(getCourse);
router.route("/videos/:courseId").get(getAllVideos);
router.route("/videos/comments/:courseId").get(giveReviewOnVideos);
export default router;
