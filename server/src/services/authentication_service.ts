import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { User } from "../models/user";
import { ErrorReply } from "../schemas/errors_schemas";
import { UserRole } from "../enums/user_role";

export const jwtSecret: string = process.env.TOKEN_SECRET ?? "jwtsecret";

declare module 'fastify' {
    export interface FastifyInstance {
        userAuthenticate: Function;
        adminAuthenticate: Function;
    }
};

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: User
    }
}

export const userAuth = (server: FastifyInstance) => (req: FastifyRequest, reply: FastifyReply) => server.userAuthenticate(req, reply);
export const adminAuth = (server: FastifyInstance) => (req: FastifyRequest, reply: FastifyReply) => server.adminAuthenticate(req, reply);

const authenticationService: FastifyPluginCallback = (server, _, done) => {
    server.register(fastifyJwt, { secret: jwtSecret });

    // Authenticate if user has valid token (is logged in)
    server.decorate('userAuthenticate', async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await req.jwtVerify();
        } catch (error) {
            const authError = error as { message?: string };
            const errorReply: ErrorReply = {
                statusCode: 401,
                error: "Unauthorized",
                message: authError.message || 'An unexpected error occurred during authentication.'
            };
            reply.code(errorReply.statusCode).send(errorReply);
        }
    });

    // Authenticate if user has valid token and is admin
    server.decorate('adminAuthenticate', async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await req.jwtVerify();
            
            if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERADMIN) {
                const errorReply: ErrorReply = {
                    statusCode: 403,
                    error: 'Forbidden',
                    message: 'You do not have permission to access this resource.'
                };
                return reply.code(errorReply.statusCode).send(errorReply);
            }
        } catch (error) {
            const authError = error as { message?: string };
            const errorReply: ErrorReply = {
                statusCode: 401,
                error: "Unauthorized",
                message: authError.message || 'An unexpected error occurred during authentication.'
            };
            reply.code(errorReply.statusCode).send(errorReply);
        }
    });

    done();
};

export default fastifyPlugin(authenticationService);