import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  refreshAccessToken,
  getCurrentStudent,
  checkRefreshToken,
  getStudent,
} from "../controllers/student.controller.js";

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
router.get("/:studentID", getStudent); // Assuming you get student by ID or Name

export default router;
