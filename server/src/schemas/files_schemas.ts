import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { AdminGuardedResponseSchema, UserGuardedResponseSchema } from "./errors_schemas";
import { AuthHeaderTypes, PaginationMetadataTypes } from "./base_schemas";
import { FileType } from "../enums/file_type";

//////////////////// Generic Schemas ////////////////////

// Schema for generic file response
const GenericFileResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the file" }),
    parentId: Type.Union([Type.Null(), Type.Number({ description: "Unique identifier of the folder in which is the file"})]),
    name: Type.String({ description: "Name of the file" }),
    type: Type.Enum(FileType, { description: "Type of the file" }),
    creatorName: Type.Union([Type.Null(), Type.String({ description: "Name of the user who created that file" })]),
    chunkAmount: Type.Number({ description: "Amount of chunks to which file was divided and saved in knowledge base, for folders this amount is 0" }),
    createdAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Creation date of the file" }),
    updatedAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Update date of the file" }),
}, { description: "Basic information about a file" });

//////////////////// Schemas for POST requests ////////////////////

// Schema for uploading file to files knowledge base
const UploadFileQueryTypes = Type.Object({
    folderId: Type.Optional(Type.Number({ description: "Folder in which uploaded file will be saved" }))
});
export type UploadFileQuery = Static<typeof UploadFileQueryTypes>;

const UploadFileResponseTypes = Type.Object({
    ...GenericFileResponseTypes.properties
}, { description: "Response containing newly created file" });
export type UploadFileResponse = Static<typeof UploadFileResponseTypes>;

export const UploadFileSchema: FastifySchema = {
    summary: "Upload a file",
    description: "Endpoint to upload a file (txt or pdf) to the knowledge base. The file is processed and its content is extracted for storage in the knowledge base. Only accessible by admin users.",
    consumes: ['multipart/form-data'],
    headers: AuthHeaderTypes,
    querystring: UploadFileQueryTypes,
    tags: ["Files"],
    response: {
        200: UploadFileResponseTypes,
        ...AdminGuardedResponseSchema
    },
};

// Schema for creating folder for files in knowledge base
const CreateFolderBodyTypes = Type.Object({
    name: Type.String({ description: "Name of the folder" }),
    parentFolderId: Type.Optional(Type.Number({ description: "Folder in which new folder will be created" }))
}, { description: "Payload to create a new folder" });
export type CreateFolderBody = Static<typeof CreateFolderBodyTypes>;

const CreateFolderResponseTypes = Type.Object({
    ...GenericFileResponseTypes.properties
}, { description: "Response containing newly created folder" });
export type CreateFolderResponse = Static<typeof CreateFolderResponseTypes>;

export const CreateFolderSchema: FastifySchema = {
    summary: "Create a folder",
    description: "Endpoint to create new folder for files in knowledge base. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    body: CreateFolderBodyTypes,
    tags: ["Files"],
    response: {
        200: CreateFolderResponseTypes,
        ...AdminGuardedResponseSchema
    },
};


//////////////////// Schemas for GET requests ////////////////////

// Schema for getting list of files from knowledge base
const GetFileListQueryTypes = Type.Object({
    page: Type.Optional(Type.Number({ description: "The page number for pagination" })),
    limit: Type.Optional(Type.Number({ description: "The number of files to retrieve per page" })),
    order: Type.Optional(Type.String({ description: "Sort order for the list of files (Default ASC)" })),
    folderId: Type.Optional(Type.Number({ description: "Folder from which files will be received" })),
    name: Type.Optional(Type.String({ description: "Filters files by partial match of their name" })),
    creatorName: Type.Optional(Type.String({ description: "Filters files by partial match of their creator's name" })),
    type: Type.Optional(Type.String({ description: "Filters files by their type" }))
}, { description: "Query parameters for paginated chat list retrieval" });
export type GetFileListQuery = Static<typeof GetFileListQueryTypes>;

const GetFileListResponseTypes = Type.Object({
    files: Type.Array(Type.Object({
        ...GenericFileResponseTypes.properties
    }), { description: "List of files from knowledge base" }),
    pagination: PaginationMetadataTypes
}, { description: "List of files from knowledge base in desc order by updated time with pagination metadata" });
export type GetFileListResponse = Static<typeof GetFileListResponseTypes>;

export const GetFileListSchema: FastifySchema = {
    summary: "Get list of files",
    description: "Retrieves a paginated list of files from knowledge base. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    querystring: GetFileListQueryTypes,
    tags: ["Files"],
    response: {
        200: GetFileListResponseTypes,
        ...AdminGuardedResponseSchema
    }
}

// Schema for getting file content and information
const GetFileInfoParamsTypes = Type.Object({
    fileId: Type.Number({ description: "ID of the file to retrieve content and information from" })
}, { description: "Parameters to identify the file" });
export type GetFileInfoParams = Static<typeof GetFileInfoParamsTypes>;

const GetFileInfoResponseTypes = Type.Object({
    ...GenericFileResponseTypes.properties,
    content: Type.String({ description: "Content of a file" })
}, { description: "Response containing file content and information" });
export type GetFileInfoResponse = Static<typeof GetFileInfoResponseTypes>;

export const GetFileInfoSchema: FastifySchema = {
    summary: "Get file information",
    description: "Retrieves information about specified file with its content. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: GetFileInfoParamsTypes,
    tags: ["Files"],
    response: {
        200: GetFileInfoResponseTypes,
        ...AdminGuardedResponseSchema
    }
}

//////////////////// Schemas for PUT requests ////////////////////

// Schema for changing file details
const UpdateFileParamsTypes = Type.Object({
    fileId: Type.Number({ description: "ID of the file to update" })
}, { description: "Parameters to identify the file to update" });
export type UpdateFileParams = Static<typeof UpdateFileParamsTypes>;

const UpdateFileBodyTypes = Type.Object({
    name: Type.String({ description: "The new name for the file" })
}, { description: "Payload containing the updated file details" });
export type UpdateFileBody = Static<typeof UpdateFileBodyTypes>;

const UpdateFileResponseTypes = Type.Object({
    ...GenericFileResponseTypes.properties
}, { description: "Response containing the updated file details" });
export type UpdateFileResponse = Static<typeof UpdateFileResponseTypes>;

export const UpdateFileSchema: FastifySchema = {
    summary: "Update file details",
    description: "Updates the name or settings of a specific file. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: UpdateFileParamsTypes,
    body: UpdateFileBodyTypes,
    tags: ["Files"],
    response: {
        200: UpdateFileResponseTypes,
        ...AdminGuardedResponseSchema
    }
};

// Schema for moving files between folders
const MoveFileParamsTypes = Type.Object({
    fileId: Type.Number({ description: "ID of the file to move" })
}, { description: "Parameters to identify the file to move" });
export type MoveFileParams = Static<typeof MoveFileParamsTypes>;

const MoveFileBodyTypes = Type.Object({
    newParentFolderId: Type.Optional(Type.Number({ description: "(Optional) ID of the new parent folder, if not specified file will be moved to main folder" }))
}, { description: "Payload containing information to which folder move this file" });
export type MoveFileBody = Static<typeof MoveFileBodyTypes>;

const MoveFileResponseTypes = Type.Object({
    ...GenericFileResponseTypes.properties
}, { description: "Response containing the updated file details" });
export type MoveFileResponse = Static<typeof MoveFileResponseTypes>;

export const MoveFileSchema: FastifySchema = {
    summary: "Move file between folders",
    description: "Moves file to specified folder. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: MoveFileParamsTypes,
    body: MoveFileBodyTypes,
    tags: ["Files"],
    response: {
        200: MoveFileResponseTypes,
        ...AdminGuardedResponseSchema
    }
};

//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a file
const DeleteFileParamsTypes = Type.Object({
    fileId: Type.Number({ description: "ID of the file to delete" })
}, { description: "Parameters to identify the file to delete" });
export type DeleteFileParams = Static<typeof DeleteFileParamsTypes>;

const DeleteFileResponseTypes = Type.Object({}, { description: "Empty response for a successful file deletion" });
export type DeleteFileResponse = Static<typeof DeleteFileResponseTypes>;

export const DeleteFileSchema: FastifySchema = {
    summary: "Delete file",
    description: "Deletes a specific file. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: DeleteFileParamsTypes,
    tags: ["Files"],
    response: {
        204: DeleteFileResponseTypes,
        ...AdminGuardedResponseSchema
    }
}