import { Static, Type } from "@sinclair/typebox"

export const Question = Type.Object({ question: Type.String() });
export type QuestionType = Static<typeof Question>;

export const Answer = Type.Object({ answer: Type.String() }, {
  description: "ReadableStream of stringified objects in format specified below."
});
export type AnswerType = Static<typeof Answer>;