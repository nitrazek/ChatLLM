import { FastifyInstance, FastifyReply, FastifyRequest, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import ollama from "../services/ollama";
import { BaseMessageChunk } from "langchain/schema";
import { CustomReply, CustomRequest } from "../utils/types";

type AskQuestionRequest = {
  question: string
}

type AskQuestionReply = {
  answer: string
}

const questionsRoute = async (fastify: FastifyInstance) => {
  fastify.post("/questions", {
    schema: {
      body: {
        type: "object",
        properties: {
          question: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            answer: { type: "string" }
          }
        }
      }
    }
  }, async (
    request: CustomRequest<AskQuestionRequest, AskQuestionReply>,
    reply: CustomReply<AskQuestionRequest, AskQuestionReply>
  ) => {
    const question: string = request.body.question;
    const messageChunk: BaseMessageChunk = await ollama.invoke(question);
    reply.send({ answer: messageChunk.content as string })
  });
};

export default questionsRoute;