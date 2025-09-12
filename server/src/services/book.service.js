import { Book } from "../models/Book.js";

function cleanCreate(input = {}) {
  const {
    title,
    author,
    description,
    type,
    condition,
    coverUrl,
    genre,
  } = input;

  const out = {};
  if (title) out.title = String(title).trim();
  if (author) out.author = String(author).trim();
  if (description !== undefined) out.description = String(description).trim();

  if (["exchange", "giveaway"].includes(type)) out.type = type;
  if (["like_new", "good", "fair"].includes(condition)) out.condition = condition;

  // allow Cloudinary URL + genre
  if (coverUrl) out.coverUrl = String(coverUrl).trim();
  if (genre !== undefined) out.genre = String(genre).trim();

  return out;
}

function cleanUpdate(input = {}) {
  // allow updating genre & coverUrl (owner edit)
  const allowed = [
    "title",
    "author",
    "description",
    "type",
    "condition",
    "coverUrl",
    "genre",
    "availability",
  ];

  const out = {};
  for (const k of allowed) if (input[k] !== undefined) out[k] = input[k];

  if (out.title) out.title = String(out.title).trim();
  if (out.author) out.author = String(out.author).trim();
  if (out.description !== undefined) out.description = String(out.description).trim();
  if (out.coverUrl !== undefined) out.coverUrl = String(out.coverUrl).trim();
  if (out.genre !== undefined) out.genre = String(out.genre).trim();

  if (out.type && !["exchange", "giveaway"].includes(out.type)) delete out.type;
  if (out.condition && !["like_new", "good", "fair"].includes(out.condition)) delete out.condition;
  if (out.availability && !["available", "unavailable"].includes(out.availability)) delete out.availability;

  return out;
}

/* ---------- services ---------- */

// USER — create a pending book
export async function createBook(ownerId, input) {
  const payload = cleanCreate(input);
  if (!payload.title || !payload.author || !payload.type) {
    const e = new Error("title, author, type (exchange|giveaway) are required");
    e.status = 400;
    throw e;
  }

  // Let schema default status to "pending" (or set explicitly)
  const doc = await Book.create({
    ...payload,
    owner: ownerId,
    status: "pending", // was "requested"
  });

  return doc;
}

// PUBLIC — list accepted books (with optional filters)
export async function listPublicBooks(
  { q, type, availability, owner, genre } = {},
  { page = 1, limit = 20 } = {}
) {
  const filter = { status: "accepted" };
  if (q) filter.$text = { $search: q };
  if (type && ["exchange", "giveaway"].includes(type)) filter.type = type;
  if (availability && ["available", "unavailable"].includes(availability)) filter.availability = availability;
  if (owner) filter.owner = owner;
  if (genre) filter.genre = genre; 
  const lim = Math.max(1, Math.min(100, limit));
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pg - 1) * lim;

  const [docs, total] = await Promise.all([
    Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate("owner", "_id firstName lastName avatarUrl email"),
    Book.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page: pg,
    limit: lim,
    hasMore: skip + docs.length < total,
  };
}

// ADMIN — list by status (pending | accepted | rejected)
export async function listByStatus(
  status = "pending",
  { q, type, genre } = {},
  { page = 1, limit = 20 } = {}
) {
  const allowed = new Set(["pending", "accepted", "rejected"]);
  const effectiveStatus = allowed.has(status) ? status : "pending";

  const filter = { status: effectiveStatus };
  if (q) filter.$text = { $search: q };
  if (type && ["exchange", "giveaway"].includes(type)) filter.type = type;
  if (genre) filter.genre = genre; // optional admin filter

  const lim = Math.max(1, Math.min(100, limit));
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pg - 1) * lim;

  const [docs, total] = await Promise.all([
    Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate("owner", "_id firstName lastName email"),
    Book.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page: pg,
    limit: lim,
    hasMore: skip + docs.length < total,
  };
}

export async function getBook(id) {
  const doc = await Book.findById(id).populate(
    "owner",
    "_id firstName lastName avatarUrl email"
  );
  if (!doc) {
    const e = new Error("Book not found");
    e.status = 404;
    throw e;
  }
  return doc;
}

// OWNER — update own book
export async function updateOwnBook(id, ownerId, input) {
  const payload = cleanUpdate(input);
  const doc = await Book.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { $set: payload },
    { new: true }
  );
  if (!doc) {
    const e = new Error("Book not found or not owned by you");
    e.status = 404;
    throw e;
  }
  return doc;
}

// ADMIN — set review status
export async function setReviewStatus(id, status) {
  const allowed = new Set(["pending", "accepted", "rejected"]); 
  if (!allowed.has(status)) {
    const e = new Error("Invalid status");
    e.status = 400;
    throw e;
  }
  const doc = await Book.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) {
    const e = new Error("Book not found");
    e.status = 404;
    throw e;
  }
  return doc;
}

// OWNER — toggle availability (only after accepted)
export async function setAvailability(id, ownerId, availability) {
  if (!["available", "unavailable"].includes(availability)) {
    const e = new Error("Invalid availability");
    e.status = 400;
    throw e;
  }
  const doc = await Book.findOne({ _id: id, owner: ownerId });
  if (!doc) {
    const e = new Error("Book not found or not owned by you");
    e.status = 404;
    throw e;
  }
  if (doc.status !== "accepted") {
    const e = new Error("Availability can be changed only after acceptance");
    e.status = 400;
    throw e;
  }
  doc.availability = availability;
  await doc.save();
  return doc;
}
