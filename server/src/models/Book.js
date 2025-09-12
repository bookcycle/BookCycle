import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Optional: a curated list you can use across the app
export const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Mystery",
  "Biography",
  "History",
  "Self-Help",
  "Children",
  "Comics",
];

const BookSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true, default: "" },

    // ✅ New: genre (allow empty OR one of the curated list)
    genre: {
      type: String,
      trim: true,
      index: true,
      validate: {
        validator: (v) => !v || GENRES.includes(v),
        message: "Invalid genre",
      },
      default: "",
    },

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

    // ✅ Align with admin pages: use 'pending' instead of 'requested'
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },

    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },

    // Cloudinary secure URL
    coverUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Include genre in text search
BookSchema.index({ title: "text", author: "text", description: "text", genre: "text" });

export const Book = model("Book", BookSchema);
export default Book;
