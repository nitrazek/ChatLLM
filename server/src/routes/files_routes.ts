import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/files_schemas";
import { adminAuth } from "../services/authentication_service";
import { BadRequestError } from "../schemas/errors_schemas";
import { getFileHandler } from "../utils/files_handlers";
import { ChromaService } from "../services/chroma_service";
import { AuthHeader } from "../schemas/base_schemas";

const filesRoutes: FastifyPluginCallback = (server, _, done) => {
    // Upload a file to the knowledge base (only admin)
    server.post<{
        Headers: AuthHeader,
        Reply: Schemas.UploadFileResponse
    }>('/upload', {
        schema: Schemas.UploadFileSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const file = await req.file();
        if (!file) throw new BadRequestError('No file was provided.');

        const fileHandler = getFileHandler(file.mimetype);
        if (!fileHandler) throw new BadRequestError('This file type is not supported.');

        const chroma = await ChromaService.getInstance();
        await chroma.addDocuments([{
            pageContent: await fileHandler(file),
            metadata: {
                fileName: file.filename
            }
        }], {
            ids: [file.filename]
        });

        reply.code(204).send();
    });

    // Get list of files from knowledge base (only admin)
    server.get<{
        Headers: AuthHeader,
        Querystring: Schemas.GetFileListQuery,
        Reply: Schemas.GetFileListResponse
    }>('/list', {
        schema: Schemas.GetFileListSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        // dupa dupa twoja stara
    });

    done();
}

export default filesRoutes;