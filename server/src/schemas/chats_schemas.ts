import { Static, Type } from "@sinclair/typebox"
import { describe } from "node:test";

export const ChatInfo = Type.Object({
  id: Type.Number({ description: "Id of new chat." }),
  name: Type.Union([Type.Null(), Type.String()], { description: "Name of new chat. If null, chat will automatically name chat on first answer", default: "test" }),
  isUsingOnlyKnowledgeBase: Type.Boolean({ description: "If true, chat model will only use context from knowledge base, else it will use also its own knowledge." })
}, {
  description: "Object containing information of single chat."
});
export type TChatInfo = Static<typeof ChatInfo>;

export const Message = Type.Object({
  sender: Type.String({ description: "Who sent message: human or ai." }),
  content: Type.String({ description: "Content of message." })
});
export type TMessage = Static<typeof Message>;

export const ErrorChatNotFound = Type.Object({
  errorMessage: Type.String({
    default: "Chat with given id was not found."
  })
}, {
  description: "Chat with given id was not found."
});
export type TErrorChatNotFound = Static<typeof ErrorChatNotFound>;

export const GetChatsResponse = Type.Array(ChatInfo, {
  description: "List of information objects of available chats."
});
export type TGetChatsResponse = Static<typeof GetChatsResponse>;

export const PostChat = Type.Object({
  name: Type.Union([Type.Null(), Type.String()], { description: "Name of new chat. If null, chat will automatically name chat on first answer", default: "test" }),
  isUsingOnlyKnowledgeBase: Type.Boolean({ description: "If true, chat model will only use context from knowledge base, else it will use also its own knowledge." })
}, {
  description: "Object containing information for creating new chat."
});
export type TPostChat = Static<typeof PostChat>;

export const GetMessagesParams = Type.Object({
  chatId: Type.Number({ description: "Chat's id." })
});
export type TGetMessagesParams = Static<typeof GetMessagesParams>;

export const GetMessagesResponse = Type.Array(Message, {
  description: "List of all messages in chat."
});
export type TGetMessagesResponse = Static<typeof GetMessagesResponse>;

export const PostMessage = Type.Object({
  question: Type.String({ description: "Content of question." }),
  newChatName: Type.Optional(Type.String({ description: "New chat name, if sent null while creating chat." }))
}, {
  description: "Information about question sent by user (newChatName field is optional)."
});
export type TPostMessage = Static<typeof PostMessage>;

export const PostMessageParams = Type.Object({
  chatId: Type.Number({ description: "Chat's id" })
});
export type TPostMessageParams = Static<typeof PostMessageParams>;

export const Answer = Type.Object({ answer: Type.String({ description: "Content of answer."}) }, {
  description: "ReadableStream of stringified answer chunks in format specified below."
});
export type TAnswer = Static<typeof Answer>;