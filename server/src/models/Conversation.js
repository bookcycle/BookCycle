import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
    lastSender: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = model("Conversation", ConversationSchema);
