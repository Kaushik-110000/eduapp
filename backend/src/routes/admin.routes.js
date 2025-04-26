import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  getCurrentAdmin,
  checkRefreshToken,
  getAdmin,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin Routes
router
  .route("/register")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    registerAdmin
  );

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-admin", verifyAdmin, getCurrentAdmin);
router.get("/check-refresh-token", checkRefreshToken);
router.get("/:adminID", verifyAdmin, getAdmin);

export default router;
