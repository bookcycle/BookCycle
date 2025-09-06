import { User } from "../models/User.js";
import { signAuthToken } from "./token.service.js";

export async function registerUser({ firstName, lastName, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const user = await User.create({ firstName, lastName, email, password }); //saving on db through User model
  const token = signAuthToken(user); //create token using Token service func
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

function sanitize(user) {
  const { _id, firstName, lastName, email, avatarUrl, createdAt, updatedAt } =
    user.toObject();
  return { _id, firstName, lastName, email, avatarUrl, createdAt, updatedAt };
}
