import { Static, Type } from "@sinclair/typebox"

export const Question = Type.Object({ question: Type.String() });
export type QuestionType = Static<typeof Question>;

export const QuestionParams = Type.Object({ chatId: Type.Number() });
export type QuestionParamsType = Static<typeof QuestionParams>;

export const Answer = Type.Object({ answer: Type.String() }, {
  description: "ReadableStream of stringified objects in format specified below."
});
export type AnswerType = Static<typeof Answer>;

export const ChatNotFound = Type.Object({
  errorMessage: Type.String({
    default: "Chat with given id was not found."
  })
});
export type ChatNotFoundType = Static<typeof ChatNotFound>;