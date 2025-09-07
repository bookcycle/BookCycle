import { User } from "../models/User.js";


const ALLOWED_FIELDS = ["firstName", "lastName", "avatarUrl"];


function sanitize(userDoc) {
  const {
    _id,
    firstName,
    lastName,
    email,
    createdAt,
    updatedAt,
  } = userDoc.toObject();
  return { _id, firstName, lastName, email, createdAt, updatedAt };
}

export async function updateUserById(id, updates) {

  const payload = {};
  for (const k of ALLOWED_FIELDS) {
    if (updates[k] !== undefined) {
      payload[k] =
        typeof updates[k] === "string" ? updates[k].trim() : updates[k];
    }
  }

  if (Object.keys(payload).length === 0) {
    const e = new Error("No valid fields to update");
    e.status = 400;
    throw e;
  }

  const user = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    projection: "firstName lastName email createdAt updatedAt",
  });

  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  return sanitize(user);
}

export { sanitize }; 
