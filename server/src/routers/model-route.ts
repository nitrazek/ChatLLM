import { FastifyPluginAsync, FastifyRegisterOptions } from "fastify";

const modelRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.post("/messages", async (request, reply) => {
    return "Hello World";
  })
};

export default modelRoute;