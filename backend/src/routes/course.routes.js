import { Router } from "express";
import {
  allCourses,
  getCourse,
  getAllVideos,
} from "../controllers/course.controller.js";
import { createRoom } from "../controllers/video.controller.js";
const router = Router();
import { verifyTutor } from "../middlewares/auth.middleware.js";
router.route("/all").get(allCourses);
router.route("/createVideo").post(verifyTutor, createRoom);
router.route("/:courseId").get(getCourse);
router.route("/videos/:courseId").get(getAllVideos);
export default router;
