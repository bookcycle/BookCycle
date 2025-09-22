import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createTransactionCtrl,
  listTransactionsCtrl,
  listAllMyTransactionsCtrl, 
  acceptTransactionCtrl,
} from "../controllers/transaction.controller.js";

const router = Router();

// Create a request
router.post("/", requireAuth, createTransactionCtrl);

// Per-book (requires ?book_id=...) — existing behavior
router.get("/", requireAuth, listTransactionsCtrl);

router.get("/mine", requireAuth, listAllMyTransactionsCtrl);

// Accept a request
router.patch("/:id/accept", requireAuth, acceptTransactionCtrl);

export default router;
