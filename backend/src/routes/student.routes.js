import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  refreshAccessToken,
  getCurrentStudent,
  checkRefreshToken,
  getStudent,
  generatePaymentOrder,
  enrollCourse,
} from "../controllers/student.controller.js";

import { createComment, giveReviewOnVideos } from "../controllers/comment.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyStudent } from "../middlewares/auth.middleware.js";

// Routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerStudent
);

router.post("/login", loginStudent);
router.post("/logout", verifyStudent, logoutStudent);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-student", verifyStudent, getCurrentStudent);
router.get("/check-refresh", checkRefreshToken);
router.get("/:studentID", getStudent);
router.post("/generatePaymentOrder", verifyStudent, generatePaymentOrder);
router.post("/enrollCourse", verifyStudent, enrollCourse);
router.post("/postcomment", createComment);
router.get("/courses/:videoId/comments", verifyStudent, giveReviewOnVideos);
export default router;
