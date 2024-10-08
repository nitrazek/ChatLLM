import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/files_schemas";

const filesRoutes: FastifyPluginCallback = (server, _, done) => {
    // Upload a file to the knowledge base (only admin)
    server.post<{
        
    }>('/', {
        
    }, async (req, reply) => {
        
    });

    done();
}

export default filesRoutes;