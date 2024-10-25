import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { AdminGuardedResponseSchema, UserGuardedResponseSchema } from "./errors_schemas";
import { AuthHeaderTypes, PaginationMetadataTypes } from "./base_schemas";
import { FileType } from "../enums/file_type";

//////////////////// Generic Schemas ////////////////////

// Schema for generic file response
const GenericFileResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the file" }),
    name: Type.String({ description: "Name of the file" }),
    type: Type.Enum(FileType, { description: "Type of the file" }),
    creatorName: Type.String({ description: "Name of the user who created that file" }),
    createdAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Creation date of the file" }),
    updatedAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Update date of the file" })
}, { description: "Basic information about a file" });

//////////////////// Schemas for POST requests ////////////////////

// Schema for uploading file to files knowledge base
const UploadFileQueryTypes = Type.Object({
    folderId: Type.Optional(Type.Number({ description: "Folder in which uploaded file will be saved" }))
});
export type UploadFileQuery = Static<typeof UploadFileQueryTypes>;

const UploadFileResponseTypes = Type.Object({}, { description: "Empty response for a successful file upload" });
export type UploadFileResponse = Static<typeof UploadFileResponseTypes>;

export const UploadFileSchema: FastifySchema = {
    summary: "Upload a file",
    description: "Endpoint to upload a file (txt or pdf) to the knowledge base. The file is processed and its content is extracted for storage in the knowledge base. Only accessible by admin users.",
    consumes: ['multipart/form-data'],
    headers: AuthHeaderTypes,
    querystring: UploadFileQueryTypes,
    tags: ["Files"],
    response: {
        204: UploadFileResponseTypes,
        ...AdminGuardedResponseSchema
    },
};


//////////////////// Schemas for GET requests ////////////////////

// Schema for getting list of files from knowledge base
const GetFileListQueryTypes = Type.Object({
    page: Type.Optional(Type.Number({ description: "The page number for pagination" })),
    limit: Type.Optional(Type.Number({ description: "The number of files to retrieve per page" })),
    folderId: Type.Optional(Type.Number({ description: "Folder from which files will be received" }))
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