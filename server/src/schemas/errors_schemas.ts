import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for errors ////////////////////

//Schema for validation Error
const ErrorReplyTypes = Type.Object ({
    statusCode: Type.Number(),
    error: Type.String(),
    message: Type.String()
});
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
