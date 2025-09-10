import { Book } from "../models/Book.js";

function cleanCreate(input = {}) {
  const { title, author, description, type, condition /*, coverUrl */ } = input;
  const out = {};
  if (title) out.title = String(title).trim();
  if (author) out.author = String(author).trim();
  if (description !== undefined) out.description = String(description).trim();
  if (["exchange", "giveaway"].includes(type)) out.type = type;
  if (["like_new", "good", "fair"].includes(condition)) out.condition = condition;
  // if (coverUrl) out.coverUrl = coverUrl;
  return out;
}

function cleanUpdate(input = {}) {
  const allowed = ["title", "author", "description", "type", "condition"/*, "coverUrl"*/];
  const out = {};
  for (const k of allowed) if (input[k] !== undefined) out[k] = input[k];

  if (out.title) out.title = String(out.title).trim();
  if (out.author) out.author = String(out.author).trim();
  if (out.description !== undefined) out.description = String(out.description).trim();
  if (out.type && !["exchange", "giveaway"].includes(out.type)) delete out.type;
  if (out.condition && !["like_new", "good", "fair"].includes(out.condition)) delete out.condition;

  return out;
}

// USER — create a requested book
export async function createBook(ownerId, input) {
  const payload = cleanCreate(input);
  if (!payload.title || !payload.author || !payload.type) {
    const e = new Error("title, author, type(exchange|giveaway) are required");
    e.status = 400;
    throw e;
  }
  const doc = await Book.create({ ...payload, owner: ownerId, status: "requested" });
  return doc;
}

// PUBLIC — list accepted books (optionally filter availability, type, q)
export async function listPublicBooks({ q, type, availability, owner } = {}, { page = 1, limit = 20 } = {}) {
  const filter = { status: "accepted" };
  if (q) filter.$text = { $search: q };
  if (type && ["exchange", "giveaway"].includes(type)) filter.type = type;
  if (availability && ["available", "unavailable"].includes(availability)) filter.availability = availability;
  if (owner) filter.owner = owner;

  const lim = Math.max(1, Math.min(100, limit));
  const skip = (Math.max(1, page) - 1) * lim;

  const docs = await Book.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(lim)
    .populate("owner", "_id firstName lastName avatarUrl");

  const total = await Book.countDocuments(filter);
  return { docs, total, page, limit: lim };
}

// ADMIN — list pending (requested) or rejected
export async function listByStatus(status = "requested", { q, type } = {}, { page = 1, limit = 20 } = {}) {
  const filter = { status };
  if (q) filter.$text = { $search: q };
  if (type && ["exchange", "giveaway"].includes(type)) filter.type = type;

  const lim = Math.max(1, Math.min(100, limit));
  const skip = (Math.max(1, page) - 1) * lim;

  const docs = await Book.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(lim)
    .populate("owner", "_id firstName lastName email");

  const total = await Book.countDocuments(filter);
  return { docs, total, page, limit: lim };
}

export async function getBook(id) {
  const doc = await Book.findById(id).populate("owner", "_id firstName lastName avatarUrl email");
  if (!doc) {
    const e = new Error("Book not found");
    e.status = 404;
    throw e;
  }
  return doc;
}

// OWNER — can update own book details while requested (optional)
// (if you want to allow edits after acceptance, you can keep this too)
export async function updateOwnBook(id, ownerId, input) {
  const payload = cleanUpdate(input);
  const doc = await Book.findOneAndUpdate({ _id: id, owner: ownerId }, payload, { new: true });
  if (!doc) {
    const e = new Error("Book not found or not owned by you");
    e.status = 404;
    throw e;
  }
  return doc;
}

// ADMIN — approve/reject
export async function setReviewStatus(id, status) {
  if (!["accepted", "rejected"].includes(status)) {
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
  // ensure only accepted books can toggle
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
