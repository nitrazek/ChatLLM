import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/users_schemas";
import { User } from "../models/user";
import { adminAuth, userAuth } from "../services/authentication_service";
import { BadRequestError } from "../schemas/errors_schemas";
import { isEmail } from "class-validator";
import { getPaginationMetadata } from "../utils/pagination_handler";
import { Like } from "typeorm";
import { UserRole } from "../enums/user_role";

const userRoutes: FastifyPluginCallback = (server, _, done) => {
    // Register new user
    server.post<{
        Body: Schemas.RegisterBody,
        Reply: Schemas.RegisterResponse
    }>('/register', {
        schema: Schemas.RegisterSchema
    }, async (req, reply) => {
        const { name, email, password } = req.body;
        const user = User.create({ name, email, password });
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

        const isPasswordValid = user.isPasswordValid(password);
        if (!isPasswordValid) throw new BadRequestError('Invalid password.');

        if (!user.activated) throw new BadRequestError('User is not activated.');

        const token = server.jwt.sign({ ...user });
        reply.send({ token });
    });

    // Get list of users (only admin)
    server.get<{
        Querystring: Schemas.GetUserListQuery,
        Reply: Schemas.GetUserListResponse
    }>('/list', {
        schema: Schemas.GetUserListSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const { page = 1, limit = 10, name, email, role, activated } = req.query;
        console.dir({ role: UserRole[role as keyof typeof UserRole] })
        const [users, totalUsers] = await User.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                ...(name !== undefined && { name: Like(`%${name}%`) }),
                ...(email != undefined && { email: Like(`%${email}%`) }),
                ...(role !== undefined && { role: role as UserRole }),
                ...(activated !== undefined && { activated })
            }
        });

        reply.send({
            users: users,
            pagination: getPaginationMetadata(page, limit, totalUsers)
        });
    });

    // Get specific user (only admin)
    server.get<{
        Params: Schemas.GetUserParams,
        Reply: Schemas.GetUserResponse
    }>('/:userId', {
        schema: Schemas.GetUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');

        reply.send(user);
    });

    // Activate specific user (only admin)
    server.put<{
        Params: Schemas.ActivateUserParams,
        Reply: Schemas.ActivateUserResponse
    }>('/:userId/activate', {
        schema: Schemas.ActivateUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');

        user.activate();
        await user.save();

        reply.send(user);
    });

    // Change details of specific user (only admin)
    server.put<{
        Params: Schemas.UpdateUserParams,
        Body: Schemas.UpdateUserBody,
        Reply: Schemas.UpdateUserResponse
    }>('/:userId/update', {
        schema: Schemas.UpdateUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');

        const { name, email, password } = req.body;
        if (!name && !email && !password) throw new BadRequestError('Need at least 1 parameter to change.');
        
        await User.update({ id: req.params.userId }, { name, email, password });
        await user.reload();
        reply.send(user);
    });

    // Delete specific user (only admin)
    server.delete<{
        Params: Schemas.DeleteUserParams,
        Reply: Schemas.DeleteUserResponse
    }>('/:userId', {
        schema: Schemas.DeleteUserSchema,
        onRequest: [adminAuth(server)]
    }, async (req, reply) => {
        const user = await User.findOneBy({ id: req.params.userId });
        if (!user) throw new BadRequestError('User do not exist.');

        await User.delete({ id: req.params.userId });
        reply.code(204).send();
    });
    
    done();
};

export default userRoutes;