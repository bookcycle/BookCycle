import { Router } from "express";
import {
  login,
  signup,
  me,
  updateMe,
  changePassword,
  googleAuth,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth); // NEW
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, updateMe);
router.post("/change-password", requireAuth, changePassword);

export default router;
