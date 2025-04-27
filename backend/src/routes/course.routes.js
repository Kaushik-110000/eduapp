import { Router } from "express";
import { allCourses } from "../controllers/course.controller.js";
import { createRoom } from "../controllers/video.controller.js";
const router = Router();
import { verifyTutor } from "../middlewares/auth.middleware.js";
router.route("/all").get(allCourses);
router.route("/createVideo").post(verifyTutor, createRoom);
export default router;
