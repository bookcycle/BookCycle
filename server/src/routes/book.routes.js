import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import {
  createBookCtrl,
  listPublicBooksCtrl,
  getBookCtrl,
  listPendingCtrl,
  listRejectedCtrl,
  setReviewStatusCtrl,
  setAvailabilityCtrl,
  updateOwnBookCtrl,
} from "../controllers/book.controller.js";

const router = Router();

// Public
router.get("/", listPublicBooksCtrl);
router.get("/:id", getBookCtrl);

// User
router.post("/", requireAuth, createBookCtrl);
router.put("/:id", requireAuth, updateOwnBookCtrl); // optional (before/after review based on policy)
router.patch("/:id/availability", requireAuth, setAvailabilityCtrl);

// Admin
router.get("/admin/pending", requireAuth, requireAdmin, listPendingCtrl);
router.get("/admin/rejected", requireAuth, requireAdmin, listRejectedCtrl);
router.patch("/admin/:id/status", requireAuth, requireAdmin, setReviewStatusCtrl);

export default router;
