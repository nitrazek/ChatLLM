import { FastifyPluginAsync, FastifyRegisterOptions } from "fastify";

const modelRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.post("/messages", {
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
  }, async (request, reply) => {
    return { answer: "Hello World" };
  })
};

export default modelRoute;