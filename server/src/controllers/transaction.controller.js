import {
  createRequest,
  listMyTransactionsForBook,
  acceptRequest,
  listMyTransactions, // ✅ NEW
} from "../services/transaction.service.js";

export async function createTransactionCtrl(req, res, next) {
  try {
    const { book_id } = req.body;
    const tx = await createRequest({ bookId: book_id, senderId: req.user.id });
    res.status(201).json({ transaction: tx });
  } catch (e) {
    next(e);
  }
}

export async function listTransactionsCtrl(req, res, next) {
  try {
    const { book_id } = req.query;
    if (!book_id) {
      const e = new Error("book_id is required");
      e.status = 400;
      throw e;
    }
    const rows = await listMyTransactionsForBook({
      userId: req.user.id,
      bookId: book_id,
    });
    res.json({ transactions: rows });
  } catch (e) {
    next(e);
  }
}

export async function listAllMyTransactionsCtrl(req, res, next) {
  try {
    const rows = await listMyTransactions({ userId: req.user.id });
    res.json({ transactions: rows });
  } catch (e) {
    next(e);
  }
}

export async function acceptTransactionCtrl(req, res, next) {
  try {
    const tx = await acceptRequest({ txId: req.params.id, ownerId: req.user.id });
    res.json({ transaction: tx });
  } catch (e) {
    next(e);
  }
}
