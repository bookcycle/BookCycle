import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TransactionSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },   // the borrower
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, // the owner (book.owner)
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

// prevent duplicate *pending* request by the same user for the same book
TransactionSchema.index({ book: 1, sender: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
