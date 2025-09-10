import {
  getOrCreateOneToOne,
  listConversationsForUser,
  sendMessage,
  getMessages,
  markConversationRead,
} from "../services/chat.service.js";

export async function startChat(req, res, next) {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      const e = new Error("participantId required");
      e.status = 400;
      throw e;
    }
    const convo = await getOrCreateOneToOne(req.user.id, participantId);
    res.json({ conversation: convo });
  } catch (err) { next(err); }
}

export async function listMyChats(req, res, next) {
  try {
    const { limit, skip } = req.query;
    const convos = await listConversationsForUser(req.user.id, {
      limit: Number(limit) || 30,
      skip: Number(skip) || 0,
    });
    res.json({ conversations: convos });
  } catch (err) { next(err); }
}

export async function listMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { before, limit } = req.query;
    const msgs = await getMessages(id, { before, limit: Number(limit) || 50 });
    res.json({ messages: msgs.reverse() });
  } catch (err) { next(err); }
}

export async function postMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { text = "", attachments = [] } = req.body || {};
    if (!text && (!attachments || attachments.length === 0)) {
      const e = new Error("Either text or attachments required");
      e.status = 400;
      throw e;
    }
    const msg = await sendMessage(id, req.user.id, { text, attachments });
    res.status(201).json({ message: msg });
  } catch (err) { next(err); }
}

export async function putRead(req, res, next) {
  try {
    const { id } = req.params;
    await markConversationRead(id, req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}
