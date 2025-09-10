import mongoose from "mongoose";
const { Schema, model } = mongoose;


const BookSchema = new Schema(
  {
    owner:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:  { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true, default: "" },

    type: {
      type: String,
      enum: ["exchange", "giveaway"],
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ["like_new", "good", "fair"],
      default: "good",
    },

    status: {
      type: String,
      enum: ["requested", "accepted", "rejected"],
      default: "requested",
      index: true,
    },
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },

    // later for Cloudinary
    coverUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

BookSchema.index({ title: "text", author: "text", description: "text" });

export const Book = model("Book", BookSchema);
