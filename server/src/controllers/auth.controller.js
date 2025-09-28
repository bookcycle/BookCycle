import {
  registerUser,
  loginUser,
  getUserById,
  loginWithGoogle,
} from "../services/auth.service.js";
import { User } from "../models/User.js";
import { updateUserById } from "../services/user.service.js";

export async function signup(req, res, next) {
  try {
    let { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    email = String(email).trim().toLowerCase();
    firstName = String(firstName).trim();
    lastName = String(lastName).trim();

    const result = await registerUser({ firstName, lastName, email, password });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    email = String(email).trim().toLowerCase();

    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const allowed = ["firstName", "lastName", "avatarUrl"];

    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] =
          typeof req.body[k] === "string" ? req.body[k].trim() : req.body[k];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const user = await updateUserById(req.user.id, updates);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optional: block for Google-only users
    if (!user.password) {
      return res
        .status(400)
        .json({ error: "Password change not available for Google account" });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword; // hashed by pre("save")
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}


export async function googleAuth(req, res, next) {
  try {
    // accept either shape from the client
    const idToken = req.body?.id_token || req.body?.idToken;
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    const result = await loginWithGoogle({ idToken });
    return res.status(200).json(result); // { user, token }
  } catch (err) {
    next(err);
  }
}

