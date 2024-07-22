import { Static, Type } from "@sinclair/typebox"

export const Question = Type.Object({ question: Type.String() });
export type QuestionType = Static<typeof Question>;

export const QuestionParams = Type.Object({ chatId: Type.Number() });
export type QuestionParamsType = Static<typeof QuestionParams>;

export const Answer = Type.Object({ answer: Type.String() }, {
  description: "ReadableStream of stringified answer chunks in format specified below."
});
export type AnswerType = Static<typeof Answer>;

export const ChatNotFound = Type.Object({
  errorMessage: Type.String({
    default: "Chat with given id was not found."
  })
});
export type ChatNotFoundType = Static<typeof ChatNotFound>;

export const CreateChat = Type.Object({
  name: Type.String(),
  useKnowledgeBase: Type.Boolean()
});
export type CreateChatType = Static<typeof CreateChat>;

export const ChatInfo = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  useKnowledgeBase: Type.Boolean()
});
export type ChatInfoType = Static<typeof ChatInfo>;

export const Chats = Type.Array(ChatInfo);
export type ChatsType = Static<typeof Chats>;

export const Messages = Type.Array(Type.Object({
  sender: Type.String(),
  content: Type.String()
}));
export type MessagesType = Static<typeof Messages>;