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
import { Auth, IsNull, Like } from "typeorm";
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

        const folder = await getFolder(folderId);
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

        const chromaService = await ChromaService.getInstance();
        await chromaService.addDocuments(file.id, splittedDocuments);

        reply.send({
            ...file,
            parentId: folder ? folder.id : null,
            creatorName: file.creator ? file.creator.name : null
        });
    });

    // Create a folder for files in knowledge base (only admin)
    server.post<{
        Headers: AuthHeader,
        Body: Schemas.CreateFolderBody,
        Reply: Schemas.CreateFolderResponse
    }>('/folders/new', {
        schema: Schemas.CreateFolderSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const { name, parentFolderId } = req.body;
        const parentFolder = await getFolder(parentFolderId);
        if(parentFolder && parentFolder.type !== FileType.FOLDER)
            throw new BadRequestError("Invalid parent folder ID");

        const folder = File.create({
            name: name,
            type: FileType.FOLDER,
            parent: parentFolder,
            creator: req.user,
            chunkAmount: 0
        });
        await folder.save();

        reply.send({
            ...folder,
            parentId: parentFolder ? parentFolder.id : null,
            creatorName: folder.creator ? folder.creator.name : null
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

        const folder = await getFolder(folderId);
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
                parent: folder !== null ? { id: folder.id } : IsNull(),
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
            files: files.map(file => ({
                ...file,
                parentId: folder ? folder.id : null,
                creatorName: file.creator ? file.creator.name : null
            })),
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
            relations: ["creator", "parent"]
        });
        if (!file) throw new BadRequestError('File do not exist.');

        const chromaService = await ChromaService.getInstance();
        const fileContent = await chromaService.getFileContent(file);

        reply.send({
            ...file,
            parentId: file.parent ? file.parent.id : null,
            content: fileContent,
            creatorName: file.creator ? file.creator.name : null
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
        onRequest: [adminAuth(server)]
    }, async(req, reply) => {
        const file = await File.findOne({
            where: { id: req.params.fileId },
            relations: ["creator", "parent"]
        });
        if (!file) throw new BadRequestError('File do not exist.');

        const { name } = req.body;
        File.merge(file, { name });
        const updatedFile = await file.save();

        reply.send({
            ...updatedFile,
            parentId: updatedFile.parent ? updatedFile.parent.id : null,
            creatorName: updatedFile.creator ? updatedFile.creator.name : null
        });
    })

    // Move file between folders (only admin)
    server.put<{
        Headers: AuthHeader,
        Params: Schemas.MoveFileParams,
        Body: Schemas.MoveFileBody,
        Reply: Schemas.MoveFileResponse
    }>('/move/:fileId', {
        schema: Schemas.MoveFileSchema,
        onRequest: [adminAuth(server)]
    }, async(req, reply) => {
        const file = await File.findOne({
            where: { id: req.params.fileId },
            relations: ["creator"]
        });
        if (!file) throw new BadRequestError('File do not exist.');

        const { newParentFolderId } = req.body;
        const newParentFolder = await getFolder(newParentFolderId);
        if(newParentFolder && newParentFolder.type !== FileType.FOLDER)
            throw new BadRequestError("Invalid folder ID");

        File.merge(file, { parent: newParentFolder });
        const updatedFile = await file.save();

        reply.send({
            ...updatedFile,
            parentId: newParentFolder ? newParentFolder.id : null,
            creatorName: updatedFile.creator ? updatedFile.creator.name : null
        })
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
    
        const chromaService = await ChromaService.getInstance();
        await chromaService.deleteFile(file);

        await file.remove();
        reply.code(204).send();
    });

    done();
}

const getFolder = async (folderId: number | undefined): Promise<File | null> => {
    if(folderId === undefined) return null;
    const folder = await File.findOneBy({ id: folderId });
    if(folder === null) throw new BadRequestError('Folder do not exist.');
    return folder;
}

export default filesRoutes;