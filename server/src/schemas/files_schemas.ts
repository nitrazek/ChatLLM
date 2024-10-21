import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { AdminGuardedResponseSchema } from "./errors_schemas";
import { AuthHeaderTypes } from "./base_schemas";

//////////////////// Schemas for POST requests ////////////////////

// Schema for uploading file to files knowledge base
const UploadFileResponseTypes = Type.Object({
}, { description: "Empty response for a successful file upload" });
export type UploadFileResponse = Static<typeof UploadFileResponseTypes>;

export const MultipartFileSchema: FastifySchema = {
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

// Empty for now



//////////////////// Schemas for PUT requests ////////////////////

// Empty for now



//////////////////// Schemas for DELETE requests ////////////////////

// Empty for now
