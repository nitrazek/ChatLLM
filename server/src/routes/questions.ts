import { FastifyInstance, FastifyReply, FastifyRequest, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import ollama from "../services/ollama";
import { BaseMessageChunk } from "langchain/schema";

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
    request: FastifyRequest<{ Body: AskQuestionRequest, Reply: AskQuestionReply }>,
    reply: FastifyReply<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, { Body: AskQuestionRequest, Reply: AskQuestionReply }>
  ) => {
    const question: string = request.body.question;
    const messageChunk: BaseMessageChunk = await ollama.invoke(question);
    reply.send({ answer: messageChunk.content as string })
  });
};

export default questionsRoute;