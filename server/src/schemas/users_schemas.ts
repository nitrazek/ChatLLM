import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import { AdminGuardedResponseSchema, NotGuardedResponseSchema } from "./errors_schemas";
import { AuthHeaderTypes, PaginationMetadataTypes } from "./base_schemas";
import { UserRole } from "../enums/user_role";

//////////////////// Generic Schemas ////////////////////

// Schema for generic user response
const GenericUserResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the user" }),
    name: Type.String({ description: "Name of the user" }),
    email: Type.String({ description: "Email address of the user" }),
    activated: Type.Boolean({ description: "Indicates whether the user's account is activated" }),
    role: Type.Enum(UserRole, { description: "Role of the user" })
}, { description: "A generic response schema for a user, containing basic user information" });


//////////////////// Schemas for POST requests ////////////////////

// Schema for user registration
const RegisterBodyTypes = Type.Object({
    name: Type.String({ description: "Name of the new user" }),
    email: Type.String({ description: "Email address of the new user" }),
    password: Type.String({ description: "Password chosen by the new user" })
}, { description: "Schema for the body of the user registration request" });
export type RegisterBody = Static<typeof RegisterBodyTypes>;

const RegisterResponseTypes = Type.Object({
}, { description: "Empty response for a successful user registration" });
export type RegisterResponse = Static<typeof RegisterResponseTypes>;

export const RegisterSchema: FastifySchema = {
    summary: "Register a new user",
    description: "Creates a new user account and stores it in the database.",
    body: RegisterBodyTypes,
    tags: ["Users"],
    response: {
        201: RegisterResponseTypes,
        ...NotGuardedResponseSchema
    }
};

// Schema for user login
const LoginBodyTypes = Type.Object({
    nameOrEmail: Type.String({ description: "User's name or email address" }),
    password: Type.String({ description: "Password provided by the user" })
}, { description: "Schema for the body of the user login request" });
export type LoginBody = Static<typeof LoginBodyTypes>;

const LoginResponseTypes = Type.Object({
    name: Type.String({ description: "Name of the user" }),
    role: Type.Enum(UserRole, { description: "Role of the user" }),
    token: Type.String({ description: "JWT token for the authenticated user" })
}, { description: "Response for a successful login, containing the JWT token" });
export type LoginResponse = Static<typeof LoginResponseTypes>;

export const LoginSchema: FastifySchema = {
    summary: "Login a user",
    description: "Authenticates a user by their name or email and password, and returns a JWT token.",
    body: LoginBodyTypes,
    tags: ["Users"],
    response: {
        200: LoginResponseTypes,
        ...NotGuardedResponseSchema
    }
};


//////////////////// Schemas for GET requests ////////////////////

// Schema for getting list of users
const GetUserListQueryTypes = Type.Object({
    page: Type.Optional(Type.Number({ description: "Page number for pagination" })),
    limit: Type.Optional(Type.Number({ description: "Limit of users per page" })),
    name: Type.Optional(Type.String({ description: "Filters users by partial match of their name" })),
    email: Type.Optional(Type.String({ description: "Filters users by partial match of their email address" })),
    role: Type.Optional(Type.String({ description: "Filters users by their assigned role" })),
    activated: Type.Optional(Type.Boolean({ description: "Filters users by activation status" }))
}, { description: "Query parameters for fetching a list of users in desc order by updated time" });
export type GetUserListQuery = Static<typeof GetUserListQueryTypes>;

const GetUserListResponseTypes = Type.Object({
    users: Type.Array(Type.Object({
        ...GenericUserResponseTypes.properties
    }), { description: "List of users" }),
    pagination: PaginationMetadataTypes
}, { description: "List of users with pagination metadata" });
export type GetUserListResponse = Static<typeof GetUserListResponseTypes>;

export const GetUserListSchema: FastifySchema = {
    summary: "Get list of users",
    description: "Retrieves a paginated list of users. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    querystring: GetUserListQueryTypes,
    tags: ["Users"],
    response: {
        200: GetUserListResponseTypes,
        ...AdminGuardedResponseSchema
    }
};

// Schema for getting specific user
const GetUserParamsTypes = Type.Object({
    userId: Type.Number({ description: "Unique identifier of the user to fetch" })
}, { description: "Parameters for fetching a specific user" });
export type GetUserParams = Static<typeof GetUserParamsTypes>;

const GetUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
}, { description: "Response schema for fetching a specific user" });
export type GetUserResponse = Static<typeof GetUserResponseTypes>;

export const GetUserSchema: FastifySchema = {
    summary: "Get specific user",
    description: "Retrieves information about a specific user by their ID. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: GetUserParamsTypes,
    tags: ["Users"],
    response: {
        200: GetUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
};


//////////////////// Schemas for PUT requests ////////////////////

// Schema for activating a user
const ActivateUserParamsTypes = Type.Object({
    userId: Type.Number({ description: "Unique identifier of the user to activate" })
}, { description: "Parameters for activating a specific user" });
export type ActivateUserParams = Static<typeof ActivateUserParamsTypes>;

const ActivateUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
}, { description: "Response schema for the activation of a user" });
export type ActivateUserResponse = Static<typeof ActivateUserResponseTypes>;

export const ActivateUserSchema: FastifySchema = {
    summary: "Activate a user",
    description: "Activates a user's account by their ID. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: ActivateUserParamsTypes,
    tags: ["Users"],
    response: {
        200: ActivateUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
};

// Schema for changing user details
const UpdateUserParamsTypes = Type.Object({
    userId: Type.Number({ description: "Unique identifier of the user to update" })
}, { description: "Parameters for updating a specific user" });
export type UpdateUserParams = Static<typeof UpdateUserParamsTypes>;

const UpdateUserBodyTypes = Type.Object({
    name: Type.Optional(Type.String({ description: "New name for the user" })),
    email: Type.Optional(Type.String({ description: "New email address for the user" })),
    password: Type.Optional(Type.String({ description: "New password for the user" }))
}, { description: "Body schema for updating a user's details" });
export type UpdateUserBody = Static<typeof UpdateUserBodyTypes>;

const UpdateUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
}, { description: "Response schema for the updated user information" });
export type UpdateUserResponse = Static<typeof UpdateUserResponseTypes>;

export const UpdateUserSchema: FastifySchema = {
    summary: "Update user details",
    description: "Updates a user's details such as name, email, or password. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: UpdateUserParamsTypes,
    body: UpdateUserBodyTypes,
    tags: ["Users"],
    response: {
        200: UpdateUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
};


//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a user
const DeleteUserParamsTypes = Type.Object({
    userId: Type.Number({ description: "Unique identifier of the user to delete" })
}, { description: "Parameters for deleting a specific user" });
export type DeleteUserParams = Static<typeof DeleteUserParamsTypes>;

const DeleteUserResponseTypes = Type.Object({
}, { description: "Empty response for a successful user deletion" });
export type DeleteUserResponse = Static<typeof DeleteUserResponseTypes>;

export const DeleteUserSchema: FastifySchema = {
    summary: "Delete a user",
    description: "Deletes a specific user by their ID. Only accessible by admin users.",
    headers: AuthHeaderTypes,
    params: DeleteUserParamsTypes,
    tags: ["Users"],
    response: {
        204: DeleteUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
};
