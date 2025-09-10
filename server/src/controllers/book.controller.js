import {
  createBook,
  listPublicBooks,
  listByStatus,
  getBook,
  updateOwnBook,
  setReviewStatus,
  setAvailability,
} from "../services/book.service.js";

/** POST /books  (user) — create requested */
export async function createBookCtrl(req, res, next) {
  try {
    const book = await createBook(req.user.id, req.body);
    res.status(201).json({ book });
  } catch (e) { next(e); }
}

/** GET /books  (public) — only accepted books */
export async function listPublicBooksCtrl(req, res, next) {
  try {
    const { q, type, availability, owner, page, limit } = req.query;
    const data = await listPublicBooks(
      { q, type, availability, owner },
      { page: parseInt(page || "1", 10), limit: parseInt(limit || "20", 10) }
    );
    res.json(data);
  } catch (e) { next(e); }
}

/** GET /books/:id (public) */
export async function getBookCtrl(req, res, next) {
  try {
    const book = await getBook(req.params.id);
    // hide rejected/requested publicly?
    res.json({ book });
  } catch (e) { next(e); }
}

/** GET /books/admin/pending (admin) */
export async function listPendingCtrl(req, res, next) {
  try {
    const { q, type, page, limit } = req.query;
    const data = await listByStatus(
      "requested",
      { q, type },
      { page: parseInt(page || "1", 10), limit: parseInt(limit || "20", 10) }
    );
    res.json(data);
  } catch (e) { next(e); }
}

/** GET /books/admin/rejected (admin) */
export async function listRejectedCtrl(req, res, next) {
  try {
    const { q, type, page, limit } = req.query;
    const data = await listByStatus(
      "rejected",
      { q, type },
      { page: parseInt(page || "1", 10), limit: parseInt(limit || "20", 10) }
    );
    res.json(data);
  } catch (e) { next(e); }
}

/** PATCH /books/admin/:id/status (admin) — accepted|rejected */
export async function setReviewStatusCtrl(req, res, next) {
  try {
    const { status } = req.body;
    const book = await setReviewStatus(req.params.id, status);
    res.json({ book });
  } catch (e) { next(e); }
}

/** PATCH /books/:id/availability (owner) — available|unavailable */
export async function setAvailabilityCtrl(req, res, next) {
  try {
    const { availability } = req.body;
    const book = await setAvailability(req.params.id, req.user.id, availability);
    res.json({ book });
  } catch (e) { next(e); }
}

/** PUT /books/:id (owner) — optional edit */
export async function updateOwnBookCtrl(req, res, next) {
  try {
    const book = await updateOwnBook(req.params.id, req.user.id, req.body);
    res.json({ book });
  } catch (e) { next(e); }
}
