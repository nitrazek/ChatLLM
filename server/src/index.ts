import fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";
import modelRoute from "./routers/model-route";

dotenv.config();

const server: FastifyInstance = fastify({ logger: true });
const port: number = process.env.PORT ? +process.env.PORT : 3000;

server.register(modelRoute, { prefix: "/api/v1/model" });

server.listen({ port: port }, (err: Error | null, address: String) => {
  console.log(`[server]: Server is running at ${address}`);
});