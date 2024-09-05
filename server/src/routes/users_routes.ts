import { FastifyInstance } from "fastify";
import { createUser, getUserByEmail, activateUser, deleteUser, getUserById, getUserByName, getAllUsers, saveUserDetails } from "../repositories/user_repository";
import { UserRole } from "../enums/user_role";
import {
    TActivateUserParams,
    TActivateUserResponse,
    TChangeUserDetailsBody,
    TChangeUserDetailsParams,
    TChangeUserDetailsResponse,
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
    ChangeUserDetailsResponse,
    DeleteUserResponse,
    LoginUserBody,
    RegisterUserBody,
    ActivateUserBody,
    ChangeUserDetailsBody,
    DeleteUserBody,
    TGetUsersBody,
    GetUsersBody,
    TGetUsersResponse,
    GetUsersResponse
} from "../schemas/users_schemas";

const userRoutes = async (fastify: FastifyInstance) => {
    // Get list of users (only admin)
    fastify.get<{
        Body: TGetUsersBody,
        Reply: TGetUsersResponse | TErrorWithMessage
    }>("/list", {
        schema: {
            summary: "Get list of users",
            description: "Retrieves a list of users",
            body: GetUsersBody,
            tags: ["Users"],
            response: {
                200: GetUsersResponse,
                401: ErrorWithMessage,
                403: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { loggedUserId } = request.body;
        const loggedUser = await getUserById(loggedUserId);
        if (!loggedUser) {
            return response.status(401).send({ errorMessage: "User performing action do not exists" });
        }

        if (loggedUser.role !== UserRole.ADMIN) {
            return response.status(403).send({ errorMessage: "Insufficient permissions" });
        }

        const users = await getAllUsers();
        return response.status(200).send(users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            activated: user.activated
        })))
    });

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
        const existingEmailUser = await getUserByEmail(email);
        if (existingEmailUser) {
            return response.status(400).send({ errorMessage: "User with this email already exists" });
        }
        const existingNameUser = await getUserByName(name);
        if (existingNameUser) {
            return response.status(400).send({ errorMessage: "User with this name already exists" });
        }

        const user = await createUser(name, email, password);
        return response.status(201).send({ id: user.id, name: user.name, email: user.email, role: user.role, activated: user.activated });
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
        const { name, password } = request.body;
        const user = await getUserByName(name);
        if (!user || user.password !== password) {
            return response.status(400).send({ errorMessage: "Invalid credentials" });
        }

        if (!user.activated) {
            return response.status(403).send({ errorMessage: "Account not activated" });
        }

        return response.status(200).send({ id: user.id, name: user.name, email: user.email, role: user.role, activated: user.activated });
    });

    // Activate specific user (only admin)
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

        return response.status(200).send({ id: user.id, name: user.name, email: user.email, role: user.role, activated: user.activated });
    });

    // Change datails of specific user (only admin)
    fastify.put<{
        Params: TChangeUserDetailsParams,
        Body: TChangeUserDetailsBody,
        Reply: TChangeUserDetailsResponse | TErrorWithMessage
    }>("/:userId/role", {
        schema: {
            summary: "Change user details",
            description: "Updates the details of a user with the provided user ID.",
            body: ChangeUserDetailsBody,
            tags: ["Users"],
            response: {
                200: ChangeUserDetailsResponse,
                400: ErrorWithMessage,
                401: ErrorWithMessage,
                403: ErrorWithMessage,
                404: ErrorWithMessage
            }
        }
    }, async (request, response) => {
        const { userId } = request.params;
        const { changes, loggedUserId } = request.body;
        const loggedUser = await getUserById(loggedUserId)

        if (!loggedUser) {
            return response.status(401).send({ errorMessage: "User performing action do not exists" });
        }

        if (loggedUser.role !== UserRole.ADMIN) {
            return response.status(403).send({ errorMessage: "Insufficient permissions" });
        }

        if (loggedUserId === userId) {
            return response.status(400).send({ errorMessage: "Cannot change your own role" });
        }

        const user = await getUserById(userId);
        if (!user) {
            return response.status(404).send({ errorMessage: "User not found" });
        }

        if (changes.role && !Object.values(UserRole).includes(changes.role as UserRole)) {
            return response.status(404).send({ errorMessage: "Role does not exist" });
        }

        if (changes.name) user.name = changes.name;
        if (changes.email) user.email = changes.email;
        if (changes.role) user.role = changes.role as UserRole;
        if (changes.password) user.password = changes.password;

        const newUser = await saveUserDetails(user);
        if (!newUser) {
            return response.status(400).send({ errorMessage: "Some values are wrong" });
        }
        return response.status(200).send({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, activated: newUser.activated });
    });

    // Delete specific user (only admin)
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
