import { Router } from "express";
import { signUploadCtrl } from "../controllers/upload.controller.js";
import { requireAuth } from "../middlewares/auth.js"; 

const router = Router();

// Client asks for a signature; then uploads directly to Cloudinary
router.post("/uploads/sign", requireAuth, signUploadCtrl);

export default router;
