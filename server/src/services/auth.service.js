import { User } from "../models/User.js";
import { signAuthToken } from "./token.service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerUser({ firstName, lastName, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    authProvider: "local",
  });
  const token = signAuthToken(user);
  return { user: sanitize(user), token };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  const valid = user && (await user.comparePassword(password));
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }
  const token = signAuthToken(user);
  return { user: sanitize(user), token };
}

/*fetching profile data */
export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return sanitize(user);
}

// NEW: Google sign-in/up using Google ID token
export async function loginWithGoogle({ idToken }) {
  if (!idToken) {
    const err = new Error("Missing idToken");
    err.status = 400;
    throw err;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload(); // email, sub, name, picture, email_verified
  const email = (payload.email || "").toLowerCase();

  if (!payload.email_verified) {
    const err = new Error("Google email not verified");
    err.status = 400;
    throw err;
  }

  let user = await User.findOne({ email });

  if (!user) {
    const firstName = payload.given_name || (payload.name || "").split(" ")[0] || "Google";
    const lastName =
      payload.family_name ||
      (payload.name || "").split(" ").slice(1).join(" ") ||
      "User";

    user = await User.create({
      firstName,
      lastName,
      email,
      googleId: payload.sub,
      avatarUrl: payload.picture,
      authProvider: "google",
    });
  } else if (!user.googleId) {
    // Link pre-existing local account
    user.googleId = payload.sub;
    if (!user.avatarUrl && payload.picture) user.avatarUrl = payload.picture;
    if (!user.password) user.authProvider = "google";
    await user.save();
  }

  const token = signAuthToken(user);
  return { user: sanitize(user), token };
}

function sanitize(user) {
  const {
    _id,
    firstName,
    lastName,
    email,
    avatarUrl,
    role,
    createdAt,
    updatedAt,
  } = user.toObject();
  return {
    _id,
    firstName,
    lastName,
    email,
    avatarUrl,
    role,
    createdAt,
    updatedAt,
  };
}
