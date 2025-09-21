import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      match: /.+\@.+\..+/,
    },
    // Optional for Google users
    password: { type: String, minlength: 8 },
    // OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Hash password only if present/modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false; // Google account with no local password
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);
