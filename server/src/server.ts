import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import baseRoutes from "./routes/base";
import modelRoutes from "./routes/model";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true })
  .withTypeProvider<TypeBoxTypeProvider>();
const port: number = process.env.PORT ? +process.env.PORT : 3000;
const host: string = process.env.HOST ?? "localhost";

fastify.register(swagger);
fastify.register(swaggerUi, {
  routePrefix: "/api/v1/documentation"
});
fastify.register(multipart);
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});
fastify.register(modelRoutes, { prefix: "/api/v1/model" });
fastify.register(baseRoutes, { prefix: "/api/v1/base" });

fastify.listen({ port: port, host: host }, (err, address) => {
  console.log(`[server]: Server is running at ${address}`);
});

fastify.ready()
  .then(() => { fastify.swagger(); });