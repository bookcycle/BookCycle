import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service.js";

import { updateUserById } from "../services/user.service.js";

export async function signup(req, res, next) {
  try {
    let { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Normalize inputs
    email = String(email).trim().toLowerCase();
    firstName = String(firstName).trim();
    lastName = String(lastName).trim();

    const result = await registerUser({ firstName, lastName, email, password });
    // Convention: 201 for resources created
    return res.status(201).json(result); // { user, token }
  } catch (err) {
    next(err); // Let global error handler format it
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
    return res.status(200).json(result); // { user, token }
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
    // Only allow specific fields to be updated
    const allowed = ["firstName", "lastName", "avatarUrl"];

    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        // Normalize strings
        updates[k] =
          typeof req.body[k] === "string" ? req.body[k].trim() : req.body[k];
      }
    }

    // If nothing valid to update, return 400
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const user = await updateUserById(req.user.id, updates);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
