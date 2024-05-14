import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import dotenv from "dotenv";
import modelRoutes from "./routes/questions";

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });
const port: number = process.env.PORT ? +process.env.PORT : 3000;

fastify.register(swagger);
fastify.register(swaggerUi, {
  routePrefix: "/documentation"
})
fastify.register(modelRoutes, { prefix: "/api/v1/model" });

fastify.listen({ port: port }, (err, address) => {
  console.log(`[server]: Server is running at ${address}`);
});

fastify.ready().then(() => {
  fastify.swagger();
});