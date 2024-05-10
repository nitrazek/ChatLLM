import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import dotenv from "dotenv";
import modelRoute from "./routes/model-route";

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });
const port: number = process.env.PORT ? +process.env.PORT : 3000;

fastify.register(swagger);
fastify.register(swaggerUi, {
  routePrefix: "/documentation"
})
fastify.register(modelRoute, { prefix: "/api/v1/model" });

fastify.listen({ port: port }, (err: Error | null, address: String) => {
  console.log(`[server]: Server is running at ${address}`);
});

fastify.ready().then(() => {
  fastify.swagger();
});