import { verifyAuthToken } from "../services/token.service.js";


export async function requireAuth(req, res, next) {
  
  const auth = req.get('authorization'); 

  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const [scheme, token] = auth.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Malformed Authorization header' });
  }

  try {
    const payload = await verifyAuthToken(token); /*verifyAuthToken() is service func */

    //req user
    req.user = { id: payload.sub ?? payload.id, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
