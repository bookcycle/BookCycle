import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createTransactionCtrl,
  listTransactionsCtrl,
  acceptTransactionCtrl,
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", requireAuth, createTransactionCtrl);            
router.get("/", requireAuth, listTransactionsCtrl);              
router.patch("/:id/accept", requireAuth, acceptTransactionCtrl); 

export default router;
