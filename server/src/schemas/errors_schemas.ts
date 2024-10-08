import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for errors ////////////////////

//Schema for validation Error
const ErrorReplyTypes = Type.Object ({
    statusCode: Type.Number({ description: "HTTP status code representing the error" }),
    error: Type.String({ description: "Type of the error, such as 'Bad Request', 'Unauthorized', etc." }),
    message: Type.String({ description: "Detailed error message explaining the reason for the error" })
}, { description: "Schema for representing error responses in the API" });
export type ErrorReply = Static<typeof ErrorReplyTypes>;

export class BadRequestError extends Error { };
export class ForbiddenError extends Error { };

export const NotGuardedResponseSchema = {
    500: ErrorReplyTypes,
    400: ErrorReplyTypes
};

export const UserGuardedResponseSchema = {
    ...NotGuardedResponseSchema,
    401: ErrorReplyTypes
};

export const AdminGuardedResponseSchema = {
    ...UserGuardedResponseSchema,
    403: ErrorReplyTypes
};
