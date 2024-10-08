import { ValidationError } from "class-validator";
import { FastifyError, FastifyPluginCallback } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { BadRequestError, ErrorReply, ForbiddenError } from "../schemas/errors_schemas";


const errorsService: FastifyPluginCallback = (server, _, done) => {
    server.setErrorHandler((error, req, reply) => {
        if (error instanceof Array && error.every(err => err instanceof ValidationError)) {
            const validationErrorArray = error as ValidationError[];
            const deserializedErors = new Set(validationErrorArray.flatMap(obj => Object.values(obj.constraints || {})));
            const stringifyErrors = [...deserializedErors].join(', ') + '.';
            const errorReply: ErrorReply = {
                statusCode: 400,
                error: "Validation Error",
                message: stringifyErrors
            };
            return reply.status(errorReply.statusCode).send(errorReply);
        }
        if (error instanceof BadRequestError) {
            const errorReply: ErrorReply = {
                statusCode: 400,
                error: "Bad Request",
                message: error.message
            };
            return reply.status(errorReply.statusCode).send(errorReply);
        }
        if (error instanceof ForbiddenError) {
            const errorReply: ErrorReply = {
                statusCode: 403,
                error: "Forbidden",
                message: error.message
            };
            return reply.status(errorReply.statusCode).send(errorReply);
        }
        const authError = error as { statusCode?: number, message?: string };
        const errorReply: ErrorReply = {
            statusCode: authError.statusCode || 500,
            error: authError.statusCode ? "Route Error" : "Internal Server Error",
            message: authError.message || 'An unexpected error occurred during authentication.'
        };
        reply.code(errorReply.statusCode).send(errorReply);
    });

    done();
};

export default fastifyPlugin(errorsService);