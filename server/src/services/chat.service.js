import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

export async function getOrCreateOneToOne(userIdA, userIdB) {
  if (String(userIdA) === String(userIdB)) {
    const e = new Error("Cannot start a chat with yourself");
    e.status = 400;
    throw e;
  }
  const participants = [String(userIdA), String(userIdB)]
    .sort()
    .map(id => new mongoose.Types.ObjectId(id));

  let convo = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });
  if (!convo) {
    convo = await Conversation.create({ participants });
  }
  return convo;
}

export async function listConversationsForUser(userId, { limit = 30, skip = 0 } = {}) {
  return Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("participants", "_id firstName lastName avatarUrl")
    .lean();
}

export async function sendMessage(conversationId, senderId, { text = "", attachments = [] }) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    const e = new Error("Conversation not found");
    e.status = 404;
    throw e;
  }
  const isParticipant = convo.participants.some(p => String(p) === String(senderId));
  if (!isParticipant) {
    const e = new Error("Not a participant in this conversation");
    e.status = 403;
    throw e;
  }

  const msg = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text,
    attachments,
    readBy: [senderId]
  });

  convo.lastMessage = text?.trim() || (attachments?.length ? "[attachment]" : "");
  convo.lastSender = senderId;
  await convo.save();

  return msg.populate("sender", "_id firstName lastName avatarUrl");
}

export async function getMessages(conversationId, { limit = 50, before } = {}) {
  const filter = { conversation: conversationId };
  if (before) filter.createdAt = { $lt: new Date(before) };

  return Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "_id firstName lastName avatarUrl")
    .lean();
}

export async function markConversationRead(conversationId, userId) {
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
  return true;
}
