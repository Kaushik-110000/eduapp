import { Router } from "express";
import {
  registerTutor,
  loginTutor,
  logoutTutor,
  refreshAccessToken,
  getCurrentTutor,
  checkRefreshToken,
  getTutor,
  createCourse,
} from "../controllers/tutor.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyTutor } from "../middlewares/auth.middleware.js";

const router = Router();

// Tutor Routes
router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerTutor);

router.route("/login").post(loginTutor);
router.post("/logout", verifyTutor, logoutTutor);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-tutor", verifyTutor, getCurrentTutor);
router.get("/check-refresh", checkRefreshToken);
router.get("/:tutorID", getTutor);
router.post("/createCourse", verifyTutor, createCourse);

export default router;
