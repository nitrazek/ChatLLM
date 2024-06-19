import { Static, Type } from "@sinclair/typebox"

export const Question = Type.Object({ question: Type.String() });
export type QuestionType = Static<typeof Question>;

export const Answer = Type.Object({ answer: Type.String() });
export type AnswerType = Static<typeof Answer>;