import { Transaction } from "../models/Transaction.js";
import { Book } from "../models/Book.js";

export async function createRequest({ bookId, senderId }) {
  const book = await Book.findById(bookId);
  if (!book) {
    const e = new Error("Book not found");
    e.status = 404;
    throw e;
  }
  // cannot request your own book
  if (String(book.owner) === String(senderId)) {
    const e = new Error("You cannot request your own book");
    e.status = 400;
    throw e;
  }
  if (book.status !== "accepted") {
    const e = new Error("Book is not yet approved by admin");
    e.status = 400;
    throw e;
  }
  if (book.availability !== "available") {
    const e = new Error("Book is currently unavailable");
    e.status = 400;
    throw e;
  }

  const tx = await Transaction.create({
    book: book._id,
    sender: senderId,
    receiver: book.owner,
    status: "pending",
  });

  return tx;
}

// Per-book + scoped to current user (existing behavior for /transactions?book_id=...)
export async function listMyTransactionsForBook({ userId, bookId }) {
  const filter = { book: bookId, $or: [{ sender: userId }, { receiver: userId }] };
  const rows = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("sender", "_id firstName lastName email")
    .populate("receiver", "_id firstName lastName email")
    .populate("book", "_id title owner");
  return rows;
}

export async function listMyTransactions({ userId }) {
  const filter = { $or: [{ sender: userId }, { receiver: userId }] };
  const rows = await Transaction.find(filter)
    .sort({ updatedAt: -1 })
    .populate("sender", "_id firstName lastName email")
    .populate("receiver", "_id firstName lastName email")
    .populate("book", "_id title owner");
  return rows;
}

export async function acceptRequest({ txId, ownerId }) {
  const tx = await Transaction.findById(txId).populate("book");
  if (!tx) {
    const e = new Error("Transaction not found");
    e.status = 404;
    throw e;
  }
  if (String(tx.receiver) !== String(ownerId)) {
    const e = new Error("Only the book owner can accept this request");
    e.status = 403;
    throw e;
  }
  if (tx.status !== "pending") {
    const e = new Error("Only pending requests can be accepted");
    e.status = 400;
    throw e;
  }

  // Mark this transaction accepted
  tx.status = "accepted";
  await tx.save();

  // Mark the book unavailable so it disappears from Explore/public lists
  const book = await Book.findById(tx.book._id);
  if (book) {
    book.availability = "unavailable";
    await book.save();
  }

  // Auto-reject other pending requests for the same book
  await Transaction.updateMany(
    { _id: { $ne: tx._id }, book: tx.book._id, status: "pending" },
    { $set: { status: "rejected" } }
  );

  return tx;
}
