import jwt from "jsonwebtoken"; //jwt token
import { config } from "../config/env.js";

//token creation
export function signAuthToken(user) {
  /*jwt.sign(payload, secret, options) */
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role }, //payload
    config.jwtSecret, //secret
    { expiresIn: "7d" } //option:
  );
}

//token verify
export function verifyAuthToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
