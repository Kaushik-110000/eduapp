import { Router } from "express";
import { allCourses } from "../controllers/course.controller.js";
const router = Router();

router.route("/courses").get(allCourses);

export default router;
