import { registerUser, loginUser, getUserById } from "../services/auth.service.js";

export async function signup(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const result = await registerUser({ firstName, lastName, email, password }); /*registerUser is a service function */
    return res.status(200).json(result);
  } 
  /*let Express’s global error handler take care of all errors in one place.*/
  catch (err) {
    next(err);
  }
}


export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (err) { next(err); }
}


export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    return res.json({ user });
  } catch (err) { next(err); }
}