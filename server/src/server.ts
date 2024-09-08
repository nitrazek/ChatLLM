import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import userRoutes from "./routes/users_routes";
import filesRoute from "./routes/files_routes";
import chatsRoutes from "./routes/chats_routes";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { AppDataSource } from "./services/database_service";

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true })
  .withTypeProvider<TypeBoxTypeProvider>();
const port: number = process.env.PORT ? +process.env.PORT : 3000;
const host: string = process.env.HOST ?? "localhost";

AppDataSource.initialize().then(() => {
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
  fastify.register(userRoutes, { prefix: "/api/v1/users" });
  fastify.register(chatsRoutes, { prefix: "/api/v1/chats" });
  fastify.register(filesRoute, { prefix: "/api/v1/files" });

  fastify.listen({ port: port, host: host }, (err, address) => {
    console.log(`[server]: Server is running at ${address}`);
  });

  fastify.ready()
    .then(() => { fastify.swagger(); });
}).catch((reason: string) => {
  console.log(reason)
})