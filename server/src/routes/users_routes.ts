import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/users_schemas";
import { User } from "../models/user";
import { adminAuth, userAuth } from "../services/authentication_service";
import { BadRequestError, ForbiddenError } from "../schemas/errors_schemas";
import { isEmail } from "class-validator";
import { getPaginationMetadata } from "../utils/pagination_handler";
import { Like, Not } from "typeorm";
import { UserRole } from "../enums/user_role";
import { AuthHeader } from "../schemas/base_schemas";

const usersRoutes: FastifyPluginCallback = (server, _, done) => {
    // Register new user
    server.post<{
        Body: Schemas.RegisterBody,
        Reply: Schemas.RegisterResponse
    }>('/register', {
        schema: Schemas.RegisterSchema
    }, async (req, reply) => {
        const { name, email, password } = req.body;
        const user = User.create({
            name,
            email,
            password
        });
        await user.save();

        reply.code(201).send();
    });

    // Login user
    server.post<{
        Body: Schemas.LoginBody,
        Reply: Schemas.LoginResponse
    }>('/login', {
        schema: Schemas.LoginSchema
    }, async (req, reply) => {
        const { nameOrEmail, password } = req.body;
        let user: User | null = null;
        if (isEmail(nameOrEmail))
            user = await User.findOneBy({ email: nameOrEmail });
        else 
            user = await User.findOneBy({ name: nameOrEmail });
        if (!user) throw new BadRequestError('User do not exist.');

        const isPasswordValid = await user.isPasswordValid(password);
        if (!isPasswordValid) throw new BadRequestError('Invalid password.');

        if (!user.activated) throw new BadRequestError('User is not activated.');

        const token = server.jwt.sign({ ...user }, {
             expiresIn: '1d'
        });
        reply.send({ name: user.name, role: user.role, token });
    });

    // Get list of users (only admin)
    server.get<{
        Headers: AuthHeader,
        Querystring: Schemas.GetUserListQuery,
        Reply: Schemas.GetUserListResponse
    }>('/list', {
        schema: Schemas.GetUserListSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const { page = 1, limit = 10, order = "DESC", name, email, role, activated } = req.query;
        if(page < 1) throw new BadRequestError("Invalid page number, must not be negative");
        if(limit < 1) throw new BadRequestError("Invalid limit value, must not be negative");
        
        const getUserRole = (role: string): UserRole => {
            if(Object.values(UserRole).includes(role as UserRole)) {
                return role as UserRole;
            } else {
                throw new BadRequestError("Invalid role value");
            }
        }

        if (!["ASC", "DESC"].includes(order.toUpperCase()))
            throw new BadRequestError("Invalid order value, must be either 'ASC' or 'DESC'");

        const [users, totalUsers] = await User.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                ...(name !== undefined && { name: Like(`%${name}%`) }),
                ...(email !== undefined && { email: Like(`%${email}%`) }),
                ...(role !== undefined && { role: getUserRole(role) }),
                ...(activated !== undefined && { activated }),
                role: Not(UserRole.SUPERADMIN)
            },
            order: { updatedAt: order.toUpperCase() === "ASC" ? "ASC" : "DESC" }
        });

        const paginationMetadata = getPaginationMetadata(page, limit, totalUsers);
        if(paginationMetadata.currentPage > paginationMetadata.totalPages)
            throw new BadRequestError("Invalid page number, must not be greater than page amount");

        reply.send({
            users: users,
            pagination: paginationMetadata
        });
    });

    // Get specific user (only admin)
    server.get<{
        Headers: AuthHeader,
        Params: Schemas.GetUserParams,
        Reply: Schemas.GetUserResponse
    }>('/:userId', {
        schema: Schemas.GetUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');
        if (user.role === UserRole.SUPERADMIN) throw new ForbiddenError('You do not have permission to access this resource.');

        reply.send(user);
    });

    // Activate specific user (only admin)
    server.put<{
        Headers: AuthHeader,
        Params: Schemas.ActivateUserParams,
        Reply: Schemas.ActivateUserResponse
    }>('/:userId/activate', {
        schema: Schemas.ActivateUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');
        if (user.role === UserRole.SUPERADMIN) throw new ForbiddenError('You do not have permission to access this resource.');

        user.activate();
        const activatedUser = await user.save()

        reply.send(activatedUser);
    });

    // Change details of specific user (only admin)
    server.put<{
        Headers: AuthHeader,
        Params: Schemas.UpdateUserParams,
        Body: Schemas.UpdateUserBody,
        Reply: Schemas.UpdateUserResponse
    }>('/:userId/update', {
        schema: Schemas.UpdateUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');
        if (user.role === UserRole.SUPERADMIN) throw new ForbiddenError('You do not have permission to access this resource.');

        const { name, email, password } = req.body;        
        User.merge(user, { name, email, password });
        const updatedUser = await user.save();

        reply.send(updatedUser);
    });

    // Delete specific user (only admin)
    server.delete<{
        Headers: AuthHeader,
        Params: Schemas.DeleteUserParams,
        Reply: Schemas.DeleteUserResponse
    }>('/:userId', {
        schema: Schemas.DeleteUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');
        if (user.role === UserRole.SUPERADMIN) throw new ForbiddenError('You do not have permission to access this resource.');

        await user.remove();
        reply.code(204).send();
    });
    
    done();
};

export default usersRoutes;