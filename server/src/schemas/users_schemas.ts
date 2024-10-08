import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import { AdminGuardedResponseSchema, NotGuardedResponseSchema } from "./errors_schemas";

//////////////////// Generic Schemas ////////////////////

// Schema for generic user response
const GenericUserResponseTypes = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    email: Type.String(),
    activated: Type.Boolean()
});


//////////////////// Schemas for POST requests ////////////////////

// Schema for user registration
const RegisterBodyTypes = Type.Object({
    name: Type.String(),
    email: Type.String(),
    password: Type.String()
});
export type RegisterBody = Static<typeof RegisterBodyTypes>;

const RegisterResponseTypes = Type.Object({
});
export type RegisterResponse = Static<typeof RegisterResponseTypes>;

export const RegisterSchema: FastifySchema = {
    summary: "",
    description: "",
    body: RegisterBodyTypes,
    tags: ["Users"],
    response: {
        201: RegisterResponseTypes,
        ...NotGuardedResponseSchema
    }
};

// Schema for user login
const LoginBodyTypes = Type.Object({
    nameOrEmail: Type.String(),
    password: Type.String()
});
export type LoginBody = Static<typeof LoginBodyTypes>;

const LoginResponseTypes = Type.Object({
    token: Type.String()
})
export type LoginResponse = Static<typeof LoginResponseTypes>;

export const LoginSchema: FastifySchema = {
    summary: "",
    description: "",
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
    page: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number())
});
export type GetUserListQuery = Static<typeof GetUserListQueryTypes>;

const GetUserListResponseTypes = Type.Array(Type.Object({
    ...GenericUserResponseTypes.properties
}));
export type GetUserListResponse = Static<typeof GetUserListResponseTypes>;

export const GetUserListSchema: FastifySchema = {
    summary: "",
    description: "",
    querystring: GetUserListQueryTypes,
    tags: ["Users"],
    response: {
        200: GetUserListResponseTypes,
        ...AdminGuardedResponseSchema
    }
};

// Schema for getting specific user
const GetUserParamsTypes = Type.Object({
    userId: Type.Number()
});
export type GetUserParams = Static<typeof GetUserParamsTypes>;

const GetUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
});
export type GetUserResponse = Static<typeof GetUserResponseTypes>;

export const GetUserSchema: FastifySchema = {
    summary: "",
    description: "",
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
    userId: Type.Number()
});
export type ActivateUserParams = Static<typeof ActivateUserParamsTypes>;

const ActivateUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
});
export type ActivateUserResponse = Static<typeof ActivateUserResponseTypes>;

export const ActivateUserSchema: FastifySchema = {
    summary: "",
    description: "",
    params: ActivateUserParamsTypes,
    tags: ["Users"],
    response: {
        200: ActivateUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
}

// Schema for changing user details
const UpdateUserParamsTypes = Type.Object({
    userId: Type.Number()
});
export type UpdateUserParams = Static<typeof UpdateUserParamsTypes>;

const UpdateUserBodyTypes = Type.Object({
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    password: Type.Optional(Type.String())
});
export type UpdateUserBody = Static<typeof UpdateUserBodyTypes>;

const UpdateUserResponseTypes = Type.Object({
    ...GenericUserResponseTypes.properties
});
export type UpdateUserResponse = Static<typeof UpdateUserResponseTypes>;

export const UpdateUserSchema: FastifySchema = {
    summary: "",
    description: "",
    params: UpdateUserParamsTypes,
    body: UpdateUserBodyTypes,
    tags: ["Users"],
    response: {
        200: UpdateUserResponseTypes,
        ...AdminGuardedResponseSchema
    }
}


//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a user
const DeleteUserParamsTypes = Type.Object({
    userId: Type.Number()
});
export type DeleteUserParams = Static<typeof DeleteUserParamsTypes>;

const DeleteUserResponseTypes = Type.Object({
});
export type DeleteUserResponse = Static<typeof DeleteUserResponseTypes>;

export const DeleteUserSchema: FastifySchema = {
    summary: "",
    description: "",
    params: DeleteUserParamsTypes,
    tags: ["Users"],
    response: {
        204: DeleteUserParamsTypes,
        ...AdminGuardedResponseSchema
    }
}
