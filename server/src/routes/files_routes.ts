import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/files_schemas";
import { adminAuth } from "../services/authentication_service";
import { BadRequestError } from "../schemas/errors_schemas";
import { resolveFileMimetype } from "../utils/files_handlers";
import { ChromaService } from "../services/chroma_service";
import { AuthHeader } from "../schemas/base_schemas";
import { File } from "../models/file";
import { getPaginationMetadata } from "../utils/pagination_handler";
import path from "path";
import { FileType } from "../enums/file_type";
import { IsNull, Like } from "typeorm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { Document } from "langchain/document";

const filesRoutes: FastifyPluginCallback = (server, _, done) => {
    // Upload a file to the knowledge base (only admin)
    server.post<{
        Headers: AuthHeader,
        Querystring: Schemas.UploadFileQuery,
        Reply: Schemas.UploadFileResponse
    }>('/upload', {
        schema: Schemas.UploadFileSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const { folderId } = req.query;
        const multipartFile = await req.file({
            limits: { fileSize: 1e9 }
        });
        if (!multipartFile) throw new BadRequestError('No file was provided.');

        const resolvedFile = resolveFileMimetype(multipartFile.mimetype);
        if (!resolvedFile) throw new BadRequestError('This file type is not supported.');
        const [fileHandler, fileType] = resolvedFile;

        const folder = folderId ? await File.findOneBy({ id: folderId }) : null;
        if(folder && folder.type !== FileType.FOLDER)
            throw new BadRequestError("Invalid folder ID");

        const fileContent = await fileHandler(multipartFile);
        const document = new Document({ pageContent: fileContent });
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });
        const splittedDocuments = await splitter.splitDocuments([document]);

        const baseFilename = path.basename(multipartFile.filename, path.extname(multipartFile.filename));
        let file = File.create({
            name: baseFilename,
            type: fileType,
            parent: folder,
            creator: req.user,
            chunkAmount: splittedDocuments.length
        });
        file = await file.save();

        const chroma = await ChromaService.getInstance();
        await Promise.all(splittedDocuments.map((document, index) => {
            return chroma.addDocuments([document], {
                ids: [`${file.id}_${index}`]
            });
        }));

        reply.send({
            ...file,
            creatorName: file.creator.name
        });
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
        const { page = 1, limit = 30, folderId, name, creatorName, type } = req.query;
        if(page < 1) throw new BadRequestError("Invalid page number, must not be negative");
        if(limit < 1) throw new BadRequestError("Invalid limit value, must not be negative");

        const folder = folderId ? await File.findOneBy({ id: folderId }) : null;
        if(folder && folder.type !== FileType.FOLDER)
            throw new BadRequestError("Invalid folder ID");

        const getFileType = (type: string): FileType => {
            if(Object.values(FileType).includes(type as FileType)) {
                return type as FileType;
            } else {
                throw new BadRequestError("Invalid type value");
            }
        }

        const [files, totalFiles] = await File.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                parent: folder !== null ? folder : IsNull(),
                ...(name !== undefined && { name: Like(`%${name}%`) }),
                ...(creatorName !== undefined && { creator: { name: Like(`%${creatorName}%`) } }),
                ...(type !== undefined && { type: getFileType(type) }),
            },
            order: { name: "ASC" },
            relations: ["creator"]
        });

        const paginationMetadata = getPaginationMetadata(page, limit, totalFiles);
        if(paginationMetadata.currentPage > paginationMetadata.totalPages)
            throw new BadRequestError("Invalid page number, must not be greater than page amount");

        reply.send({
            files: files.map(file => ({ ...file, creatorName: file.creator.name })),
            pagination: paginationMetadata
        });
    });

    // Get file content and information (only admin)
    server.get<{
        Headers: AuthHeader,
        Params: Schemas.GetFileInfoParams,
        Reply: Schemas.GetFileInfoResponse
    }>('/:fileId', {
        schema: Schemas.GetFileInfoSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const file = await File.findOne({
            where: { id: req.params.fileId },
            relations: ["creator"]
        });
        if (!file) throw new BadRequestError('File do not exist.');

        const chroma = await ChromaService.getInstance();
        const fileContent = await chroma.collection.get({
            ids: Array.from({ length: file.chunkAmount }, (_, i) => i).map(index => `${file.id}_${index}`)
        });
        const fileContentIds: string[] = fileContent.ids;
        const fileContentDocuments: string[] = fileContent.documents;
        const fileContentString: string = fileContentDocuments
            .map((document, index) => ({ key: fileContentIds[index], value: document }))
            .sort((a, b) => {
                const numA = parseInt(a.key.split("_")[1]);
                const numB = parseInt(b.key.split("_")[1]);
                return numA - numB;
            })
            .map((documentObj, index) => index === 0 ? documentObj.value : documentObj.value.substring(200))
            .join();

        reply.send({
            ...file,
            content: fileContentString,
            creatorName: file.creator.name
        });
    });

    // Change details of specified file (only admin)
    server.put<{
        Headers: AuthHeader,
        Params: Schemas.UpdateFileParams,
        Body: Schemas.UpdateFileBody,
        Reply: Schemas.UpdateFileResponse
    }>('/:fileId', {
        schema: Schemas.UpdateFileSchema,
        onRequest:[adminAuth(server)]
    }, async(req, reply) => {
        const file = await File.findOne({
            where: { id: req.params.fileId },
            relations: ["creator"]
        });
        if (!file) throw new BadRequestError('File do not exist.');

        const { name } = req.body;
        File.merge(file, { name });
        const updatedFile = await file.save();

        reply.send({
            ...updatedFile,
            creatorName: updatedFile.creator.name
        });
    })

    // Delete specific file (only admin)
    server.delete<{
        Headers: AuthHeader,
        Params: Schemas.DeleteFileParams,
        Reply: Schemas.DeleteFileResponse
    }>('/:fileId', {
        schema: Schemas.DeleteFileSchema,
        onRequest:[adminAuth(server)]
    }, async (req, reply) => {
        const file = await File.findOneBy({ id: req.params.fileId });
        if (!file) throw new BadRequestError('File do not exist.');
    
        const chroma = await ChromaService.getInstance();
        await chroma.delete({
            ids: Array.from({ length: file.chunkAmount }, (_, i) => i).map(index => `${file.id}_${index}`)
        });

        await file.remove();
        reply.code(204).send();
    });

    done();
}

export default filesRoutes;