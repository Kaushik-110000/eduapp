import express from "express";
import { getVideosByCourseId } from "../controllers/videos.controller.js";

const router = express.Router();

// Get videos by course ID
router.get("/course/:courseId", getVideosByCourseId);

export default router; 