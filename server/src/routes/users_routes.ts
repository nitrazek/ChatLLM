import { FastifyInstance } from "fastify";
import { createUser, getUserByEmail, activateUser, deleteUser, changeUserRole, getUserById } from "../repositories/user_repository";
import { UserRole } from "../enums/user_role";
import {
    TActivateUserParams,
    TActivateUserResponse,
    TChangeUserRoleBody,
    TChangeUserRoleParams,
    TChangeUserRoleResponse,
    TDeleteUserParams,
    TLoginUserBody,
    TLoginUserResponse,
    TRegisterUserBody,
    TRegisterUserResponse,
    TErrorWithMessage,
    TActivateUserBody,
    TDeleteUserBody,
    RegisterUserResponse,
    ErrorWithMessage,
    LoginUserResponse,
    ActivateUserResponse,
    ChangeUserRoleResponse,
    DeleteUserResponse,
    LoginUserBody,
    RegisterUserBody,
    ActivateUserBody,
    ChangeUserRoleBody,
    DeleteUserBody
} from "../schemas/users_schemas";

const userRoutes = async (fastify: FastifyInstance) => {

    // Register new user
    fastify.post<{
        Body: TRegisterUserBody,
        Reply: TRegisterUserResponse | TErrorWithMessage
    }>("/register", {
        schema: {
            summary: "Register new user",
            description: "Registers a new user with the provided details.",
            body: RegisterUserBody,
            tags: ["Users"],
            response: {
                201: RegisterUserResponse,
                400: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { name, email, password } = request.body;
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return response.status(400).send({ errorMessage: "User already exists" });
        }

        const user = await createUser(name, email, password);
        return response.status(201).send({ id: user.id, name: user.name, email: user.email, role: user.role });
    });

    // Login user
    fastify.post<{
        Body: TLoginUserBody,
        Reply: TLoginUserResponse | TErrorWithMessage
    }>("/login", {
        schema: {
            summary: "User login",
            description: "Authenticates a user and returns a token.",
            body: LoginUserBody,
            tags: ["Users"],
            response: {
                200: LoginUserResponse,
                400: ErrorWithMessage,
                403: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { email, password } = request.body;
        const user = await getUserByEmail(email);
        if (!user || user.password !== password) {
            return response.status(400).send({ errorMessage: "Invalid credentials" });
        }

        if (!user.activated) {
            return response.status(403).send({ errorMessage: "Account not activated" });
        }

        return response.status(200).send({ id: user.id, name: user.name, email: user.email, role: user.role });
    });

    // Activate specific user
    fastify.put<{
        Params: TActivateUserParams,
        Body: TActivateUserBody,
        Reply: TActivateUserResponse | TErrorWithMessage
    }>("/:userId/activate", {
        schema: {
            summary: "Activate user",
            description: "Activates the user account with the provided activation token.",
            body: ActivateUserBody,
            tags: ["Users"],
            response: {
                200: ActivateUserResponse,
                400: ErrorWithMessage,
                401: ErrorWithMessage,
                403: ErrorWithMessage,
                404: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { userId } = request.params;
        const { loggedUserId } = request.body;
        const loggedUser = await getUserById(loggedUserId)

        if (!loggedUser) {
            return response.status(401).send({ errorMessage: "User performing action do not exists" });
        }

        if (loggedUser.role !== UserRole.ADMIN) {
            return response.status(403).send({ errorMessage: "Insufficient permissions" });
        }

        if (loggedUserId === userId) {
            return response.status(400).send({ errorMessage: "Cannot activate your own account" });
        }

        const user = await activateUser(userId);
        if (!user) {
            return response.status(404).send({ errorMessage: "User not found" });
        }

        return response.status(200).send({ id: user.id, name: user.name, email: user.email, role: user.role });
    });

    // Change role of specific user
    fastify.put<{
        Params: TChangeUserRoleParams,
        Body: TChangeUserRoleBody,
        Reply: TChangeUserRoleResponse | TErrorWithMessage
    }>("/:userId/role", {
        schema: {
            summary: "Change user role",
            description: "Updates the role of a user with the provided user ID.",
            body: ChangeUserRoleBody,
            tags: ["Users"],
            response: {
                200: ChangeUserRoleResponse,
                400: ErrorWithMessage,
                401: ErrorWithMessage,
                403: ErrorWithMessage,
                404: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { userId } = request.params;
        const { role, loggedUserId } = request.body;
        const loggedUser = await getUserById(loggedUserId)

        if (!loggedUser) {
            return response.status(401).send({ errorMessage: "User performing action do not exists" });
        }

        if (loggedUser.role !== UserRole.ADMIN) {
            return response.status(403).send({ errorMessage: "Insufficient permissions" });
        }

        if (!Object.values(UserRole).includes(role as UserRole)) {
            return response.status(400).send({ errorMessage: "Role does not exist" });
        }

        if (loggedUserId === userId) {
            return response.status(400).send({ errorMessage: "Cannot change your own role" });
        }

        const user = await changeUserRole(userId, role as UserRole);
        if (!user) {
            return response.status(404).send({ errorMessage: "User not found" });
        }

        return response.status(200).send({ id: user.id, name: user.name, email: user.email, role: user.role });
    });

    // Delete specific user
    fastify.delete<{
        Params: TDeleteUserParams,
        Body: TDeleteUserBody,
        Reply: TErrorWithMessage
    }>("/:userId", {
        schema: {
            summary: "Delete user",
            description: "Deletes a user with the specified ID.",
            body: DeleteUserBody,
            tags: ["Users"],
            response: {
                200: DeleteUserResponse,
                401: ErrorWithMessage,
                403: ErrorWithMessage,
                404: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { userId } = request.params;
        const { loggedUserId } = request.body;
        const loggedUser = await getUserById(loggedUserId)

        if (!loggedUser) {
            return response.status(401).send({ errorMessage: "User performing action do not exists" });
        }

        if (loggedUser.role !== UserRole.ADMIN) {
            return response.status(403).send({ errorMessage: "Insufficient permissions" });
        }

        if (loggedUserId === userId) {
            return response.status(400).send({ errorMessage: "Cannot delete your own account" });
        }

        const user = await getUserById(userId);
        if (!user) {
            return response.status(404).send({ errorMessage: "User not found" });
        }

        await deleteUser(userId);
        return response.status(204).send();
    });
};

export default userRoutes;
