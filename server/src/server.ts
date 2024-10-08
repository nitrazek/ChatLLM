import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import userRoutes from "./routes/users_routes";
import filesRoutes from "./routes/files_routes";
import chatsRoutes from "./routes/chats_routes";
import { AppDataSource } from "./services/database_service";
import errorsService from "./services/errors_service";
import authenticationService from "./services/authentication_service";

class Application {
    private server: FastifyInstance;
    private port: number;
    private host: string;
  
    constructor() {
        this.server = Fastify({ logger: true });
        this.port = process.env.PORT ? +process.env.PORT : 3000;
        this.host = process.env.HOST ?? "localhost";
    }

    async main() {
        await this.connectDatabase();
        this.registerSwagger();
        this.registerEndpointsTypes();
        this.registerPlugins();
        this.registerRoutes();
        await this.startHttpServer();

        this.server.ready().then(() => { this.server.swagger(); });
    }

    private async connectDatabase() {
        try {
            await AppDataSource.initialize();
            console.log(`[server]: Server connected to database`);
        } catch (error: unknown) {
            console.error(error);
            console.log('[server]: Exiting...');
            process.exit(1);
        }
    }

    private async startHttpServer() {
        try {
            const address = await this.server.listen({ port: this.port, host: this.host });
            console.log(`[server]: Server is running at ${address}`);
        } catch(error: unknown) {
            console.error(error);
            process.exit(1);
        }
    }

    private registerSwagger() {
        this.server.register(swagger);
        this.server.register(swaggerUi, {
            routePrefix: "/api/v1/documentation"
        });
    }

    private registerEndpointsTypes() {
        this.server.register(multipart);
        this.server.register(cors, {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        });
    }

    private registerPlugins() {
        this.server.register(errorsService);
        this.server.register(authenticationService);
    }

    private registerRoutes() {
        this.server.register(userRoutes, { prefix: "/api/v1/users" });
        this.server.register(chatsRoutes, { prefix: "/api/v1/chats" });
        this.server.register(filesRoutes, { prefix: "/api/v1/files" });
    }
}

const appInstance = new Application();
appInstance.main();
