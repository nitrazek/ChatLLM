import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for errors ////////////////////

//Schema for validation Error
const ErrorReplyTypes = Type.Object ({
    statusCode: Type.Number({ description: "HTTP status code representing the error" }),
    error: Type.String({ description: "Type of the error, such as 'Bad Request', 'Unauthorized', etc." }),
    message: Type.String({ description: "Detailed error message explaining the reason for the error" })
}, { description: "Schema for representing error responses in the API" });
export type ErrorReply = Static<typeof ErrorReplyTypes>;

const createErrorSchema = (description: string) => {
    return Type.Object({
        ...ErrorReplyTypes.properties
    }, { description });
}

export class BadRequestError extends Error { };
export class ForbiddenError extends Error { };

export const NotGuardedResponseSchema = {
    500: createErrorSchema("An unexpected error occurred on the server"),
    400: createErrorSchema("Request contains invalid syntax or missing required parameters")
};

export const UserGuardedResponseSchema = {
    ...NotGuardedResponseSchema,
    401: createErrorSchema("User is not authenticated, or the authentication token is missing or invalid")
};

export const ChatOwnerGuardedResponseSchema = {
    ...UserGuardedResponseSchema,
    403: createErrorSchema("User is authenticated, but lacks permissions to access this resource")
};

export const AdminGuardedResponseSchema = {
    ...UserGuardedResponseSchema,
    403: createErrorSchema("Only administrators can access this resource")
};
