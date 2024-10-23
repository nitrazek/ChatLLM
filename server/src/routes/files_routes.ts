import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/files_schemas";
import { adminAuth } from "../services/authentication_service";
import { BadRequestError } from "../schemas/errors_schemas";
import { resolveFileMimetype } from "../utils/files_handlers";
import { ChromaService } from "../services/chroma_service";
import { AuthHeader } from "../schemas/base_schemas";
import { File } from "../models/file";

const filesRoutes: FastifyPluginCallback = (server, _, done) => {
    // Upload a file to the knowledge base (only admin)
    server.post<{
        Headers: AuthHeader,
        Reply: Schemas.UploadFileResponse
    }>('/', {
        schema: Schemas.MultipartFileSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const multipartFile = await req.file();
        if (!multipartFile) throw new BadRequestError('No file was provided.');

        const resolvedFile = resolveFileMimetype(multipartFile.mimetype);
        if (!resolvedFile) throw new BadRequestError('This file type is not supported.');
        const [fileHandler, fileType] = resolvedFile;

        let file = File.create({
            name: multipartFile.filename,
            type: fileType,
            creator: req.user
        });
        file = await file.save();

        const chroma = await ChromaService.getInstance();
        await chroma.addDocuments([{
            pageContent: await fileHandler(multipartFile),
            metadata: {
                id: file.id
            }
        }], {
            ids: [file.id.toString()]
        });

        reply.code(204).send();
    });

    done();
}

export default filesRoutes;