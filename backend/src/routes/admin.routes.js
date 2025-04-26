import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  getCurrentAdmin,
  checkRefreshToken,
  getAdmin,
  verifyTutor,
  listUnverifiedTutors,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin Routes
router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerAdmin);

router.post("/login", loginAdmin);
router.post("/logout", verifyAdmin, logoutAdmin);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-admin", verifyAdmin, getCurrentAdmin);
router.get("/check-refresh", checkRefreshToken);
router.get("/:adminID", verifyAdmin, getAdmin);
router.post("/verify/:tutorID", verifyAdmin, verifyTutor);
router.post("/unverifiedTutors", verifyAdmin, listUnverifiedTutors);
export default router;
