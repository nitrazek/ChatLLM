import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { AdminGuardedResponseSchema, UserGuardedResponseSchema } from "./errors_schemas";
import { AuthHeaderTypes, PaginationMetadataTypes } from "./base_schemas";

//////////////////// Generic Schemas ////////////////////

// Schema for generic file response
const GenericFileResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the file" }),
    name: Type.String({ description: "Name of the file" }),
    createdAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Creation date of the file" }),
    updatedAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Update date of the file" })
}, { description: "Basic information about a file" });

//////////////////// Schemas for POST requests ////////////////////

// Schema for uploading file to files knowledge base
const UploadFileResponseTypes = Type.Object({
}, { description: "Empty response for a successful file upload" });
export type UploadFileResponse = Static<typeof UploadFileResponseTypes>;

export const UploadFileSchema: FastifySchema = {
    summary: "Upload a file",
    description: "Endpoint to upload a file (txt or pdf) to the knowledge base. The file is processed and its content is extracted for storage in the knowledge base.",
    consumes: ['multipart/form-data'],
    headers: AuthHeaderTypes,
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
    limit: Type.Optional(Type.Number({ description: "The number of files to retrieve per page" }))
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
    description: "Retrieves a paginated list of files from knowledge base.",
    headers: AuthHeaderTypes,
    querystring: GetFileListQueryTypes,
    tags: ["Files"],
    response: {
        200: GetFileListResponseTypes,
        ...AdminGuardedResponseSchema
    }
}

//////////////////// Schemas for PUT requests ////////////////////

// Empty for now



//////////////////// Schemas for DELETE requests ////////////////////

// Empty for now
