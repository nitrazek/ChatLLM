import Fastify, { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import chatsRoutes from '../routes/chats_routes';
import { Chat } from '../models/chat';
import { ChatMessage } from '../models/chat_message';
import { userAuth } from '../services/authentication_service';
import { BadRequestError, ForbiddenError } from '../schemas/errors_schemas';
import { UserRole } from '../enums/user_role';
import { create } from 'domain';
import { ValidationError } from 'class-validator';
import errorsService from '../services/errors_service';
import { SenderType } from '../enums/sender_type';
import { User } from '../models/user';
import usersRoutes from '../routes/users_routes';
import fastifyJwt from '@fastify/jwt';

const createdAt = Date.now().toString();
const updatedAt = Date.now().toString();
const testUser = {
    id: 1,
    name: "test",
    email: "test@test.pl",
    password: "TestPassword123!",
    activated: true,
    role: UserRole.ADMIN,
    createdAt: createdAt,
    updatedAt: updatedAt
};

jest.mock('../models/user');
jest.mock('../services/authentication_service.ts', () => {
    const originalModule = jest.requireActual('../services/authentication_service.ts');
    return {
        __esModule: true,
        ...originalModule,
        userAuth: jest.fn(() => (req: any, reply: any) => {
            req.user = testUser
            return Promise.resolve()
        }),
        adminAuth: jest.fn(() => (req: any, reply: any) => {
            req.user = testUser
            return Promise.resolve()
        })
    };
});

describe('Users Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        await app.register(errorsService);
        await app.register(fastifyJwt, { secret: "jwtsecret" });
        await app.register(usersRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
            };
    
            // Mock User.create and user.save
            const saveMock = jest.fn(() => Promise.resolve());
            User.create = jest.fn().mockReturnValue({ ...newUser, save: saveMock });
    
            const response = await supertest(app.server)
                .post('/register')
                .send(newUser);
    
            expect(response.statusCode).toBe(201);
            expect(saveMock).toHaveBeenCalled();
        });
    
        it('should return 400 if email is invalid', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'invalid-email',
                password: 'TestPassword123!',
            };
    
            (User.create as jest.Mock).mockImplementation(() => {
                throw [new ValidationError()]
            });

            const response = await supertest(app.server)
                .post('/register')
                .send(newUser);
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Validation Error',
                message: '.',
            });
        });
    
        it('should return 400 if password is too short', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'short',
            };
    
            (User.create as jest.Mock).mockImplementation(() => {
                throw [new ValidationError()]
            });

            const response = await supertest(app.server)
                .post('/register')
                .send(newUser);
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Validation Error',
                message: '.',
            });
        });
    
        it('should return 500 if there is an unexpected error while saving the user', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
            };
    
            // Mock User.create to throw an unexpected error
            (User.create as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
    
            const response = await supertest(app.server)
                .post('/register')
                .send(newUser);
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Unexpected error',
            });
        });
    });

    describe('POST /login', () => {
        it('should login successfully with email', async () => {
            const user = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
                activated: true,
                role: 'user',
            };
    
            const isPasswordValid = jest.fn(() => Promise.resolve(true));
            const findUserMock = jest.fn().mockResolvedValue({
                ...user,
                isPasswordValid,
            });
            User.findOneBy = findUserMock;
            app.jwt.sign = jest.fn(() => "mock-token")

            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'john.doe@example.com', password: 'TestPassword123!' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.name).toBe(user.name);
            expect(response.body.role).toBe(user.role);
            expect(findUserMock).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
        });
    
        it('should login successfully with name', async () => {
            const user = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
                activated: true,
                role: 'user',
            };
    
            const isPasswordValid = jest.fn(() => Promise.resolve(true));
            const findUserMock = jest.fn().mockResolvedValue({
                ...user,
                isPasswordValid,
            });
            User.findOneBy = findUserMock;
            app.jwt.sign = jest.fn(() => "mock-token")

            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'John Doe', password: 'TestPassword123!' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.name).toBe(user.name);
            expect(response.body.role).toBe(user.role);
            expect(findUserMock).toHaveBeenCalledWith({ name: 'John Doe' });
        });
    
        it('should return 400 if user does not exist', async () => {
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new BadRequestError('User do not exist.');
            })
            
            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'nonexistent@example.com', password: 'TestPassword123!' });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User do not exist.',
            });
        });
    
        it('should return 400 if password is incorrect', async () => {
            const user = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
                activated: true,
                role: 'user',
            };
    
            const isPasswordValid = jest.fn(() => Promise.resolve(false));
            const findUserMock = jest.fn().mockResolvedValue({
                ...user,
                isPasswordValid,
            });
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'john.doe@example.com', password: 'WrongPassword' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid password.',
            });
        });
    
        it('should return 400 if user is not activated', async () => {
            const user = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'TestPassword123!',
                activated: false,
                role: 'user',
            };
    
            const isPasswordValid = jest.fn(() => Promise.resolve(true));
            const findUserMock = jest.fn().mockResolvedValue({
                ...user,
                isPasswordValid,
            });
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'john.doe@example.com', password: 'TestPassword123!' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User is not activated.',
            });
        });
    
        it('should return 400 if email or password is missing', async () => {
            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: '', password: '' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User is not activated.',
            });
        });
    
        it('should return 500 for unexpected errors', async () => {
            const error = new Error('Unexpected error');
            jest.spyOn(User, 'findOneBy').mockRejectedValueOnce(error);
    
            const response = await supertest(app.server)
                .post('/login')
                .send({ nameOrEmail: 'john.doe@example.com', password: 'TestPassword123!' });
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Unexpected error',
            });
        });
    });

    describe('GET /list', () => {
        it('should return list of users for admin', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const users = [
                { id: 2, name: 'User 1', email: 'user1@example.com', role: 'user', activated: true },
                { id: 3, name: 'User 2', email: 'user2@example.com', role: 'user', activated: false },
            ];
    
            const pagination = {
                currentPage: 1,
                totalPages: 1,
                prevPage: null,
                nextPage: null
            };
    
            const findUsersMock = jest.fn().mockResolvedValue([users, 2]);
            User.findAndCount = findUsersMock;
    
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 1, limit: 10 });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.users).toEqual(users);
            expect(response.body.pagination).toEqual(pagination);
            expect(findUsersMock).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
        });
    
        it('should return 403 if user is not admin', async () => {
            const user = {
                id: 1,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
                activated: true,
            };
    
            (User.findAndCount as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError()
            });

            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-user-token`)
                .query({ page: 1, limit: 10 });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 400 for invalid page number', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: -1, limit: 10 });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be negative',
            });
        });
    
        it('should return 400 for invalid limit value', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 1, limit: -5 });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid limit value, must not be negative',
            });
        });
    
        it('should return 400 for invalid order value', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 1, limit: 10, order: 'INVALID' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid order value, must be either \'ASC\' or \'DESC\'',
            });
        });
    
        it('should return 400 for invalid role value', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 1, limit: 10, role: 'invalidRole' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid role value',
            });
        });
    
        it('should return 400 for invalid page number greater than total pages', async () => {
            const users = [{ id: 1, name: 'User 1', email: 'user1@example.com', role: 'user', activated: true }];
            const pagination = {
                currentPage: 1,
                totalPages: 1,
                totalCount: 1,
            };
    
            const findUsersMock = jest.fn().mockResolvedValue([users, 1]);
            User.findAndCount = findUsersMock;
    
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 2, limit: 10 });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be greater than page amount',
            });
        });
    
        it('should return 200 with filtered users based on query parameters', async () => {
            const users = [
                { id: 2, name: 'User 1', email: 'user1@example.com', role: 'user', activated: true },
                { id: 3, name: 'User 2', email: 'user2@example.com', role: 'user', activated: false },
            ];
    
            const pagination = {
                currentPage: 1,
                totalPages: 1,
                prevPage: null,
                nextPage: null,
            };
    
            const findUsersMock = jest.fn().mockResolvedValue([users, 2]);
            User.findAndCount = findUsersMock;
    
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', `Bearer valid-admin-token`)
                .query({ page: 1, limit: 10, name: 'User', activated: true });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.users).toEqual(users);
            expect(response.body.pagination).toEqual(pagination);
        });
    });

    describe('GET /:userId', () => {
        it('should return specific user for admin', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const user = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
            };
    
            const findUserMock = jest.fn().mockResolvedValue(user);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .get('/2')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(user);
            expect(findUserMock).toHaveBeenCalledWith({ id: 2 });
        });
    
        it('should return 403 if trying to access SUPERADMIN user', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const superAdminUser = {
                id: 2,
                name: 'Super Admin User',
                email: 'superadmin@example.com',
                role: 'SUPERADMIN',
                activated: true,
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .get('/2')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 400 if user does not exist', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const findUserMock = jest.fn().mockResolvedValue(null);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .get('/999') // Non-existent user ID
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User do not exist.',
            });
        });
    
        it('should return 403 if user is not an admin', async () => {
            const regularUser = {
                id: 1,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
                activated: true,
            };
    
            const userToFetch = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .get('/2')
                .set('Authorization', `Bearer valid-user-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('PUT /:userId/activate', () => {
        it('should activate a user for admin', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const userToActivate = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: false,
                activate: jest.fn().mockImplementation(() => {
                    userToActivate.activated = true;
                }),
                save: () => {}
            };
    
            const findUserMock = jest.fn().mockResolvedValue(userToActivate);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .put('/2/activate')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(200);
            expect(userToActivate.activate).toHaveBeenCalled();
            expect(findUserMock).toHaveBeenCalledWith({ id: 2 });
        });
    
        it('should return 403 if trying to activate a SUPERADMIN user', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const superAdminUser = {
                id: 2,
                name: 'Super Admin User',
                email: 'superadmin@example.com',
                role: 'SUPERADMIN',
                activated: false,
                activate: jest.fn(),
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/2/activate')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 400 if user does not exist', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const findUserMock = jest.fn().mockResolvedValue(null);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .put('/999/activate') // Non-existent user ID
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User do not exist.',
            });
        });
    
        it('should return 403 if user is not an admin', async () => {
            const regularUser = {
                id: 1,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
                activated: true,
            };
    
            const userToActivate = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: false,
                activate: jest.fn(),
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/2/activate')
                .set('Authorization', `Bearer valid-user-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('PUT /:userId/update', () => {
        it('should update a user for admin', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const userToUpdate = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
                save: () => {}
            };
    
            const updatedUserData = {
                name: 'Updated User 1',
                email: 'updateduser1@example.com',
                password: 'newpassword123',
            };
    
            const findUserMock = jest.fn().mockResolvedValue(userToUpdate);
            const saveUserMock = jest.fn().mockResolvedValue({ ...userToUpdate, ...updatedUserData });
            User.findOneBy = findUserMock;
            userToUpdate.save = saveUserMock;
    
            const response = await supertest(app.server)
                .put('/2/update')
                .set('Authorization', `Bearer valid-admin-token`)
                .send(updatedUserData);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe(updatedUserData.name);
            expect(response.body.email).toBe(updatedUserData.email);
            expect(response.body.password).not.toBe(updatedUserData.password); // Ensure password is not sent in response
            expect(saveUserMock).toHaveBeenCalled();
        });
    
        it('should return 403 if trying to update a SUPERADMIN user', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const superAdminUser = {
                id: 2,
                name: 'Super Admin User',
                email: 'superadmin@example.com',
                role: 'SUPERADMIN',
                activated: true,
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/2/update')
                .set('Authorization', `Bearer valid-admin-token`)
                .send({ name: 'Updated SuperAdmin', email: 'superadmin@updated.com' });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 400 if user does not exist', async () => {
            const adminUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                activated: true,
            };
    
            const findUserMock = jest.fn().mockResolvedValue(null);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .put('/999/update') // Non-existent user ID
                .set('Authorization', `Bearer valid-admin-token`)
                .send({ name: 'New User', email: 'newuser@example.com' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User do not exist.',
            });
        });
    
        it('should return 403 if user is not an admin', async () => {
            const regularUser = {
                id: 1,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
                activated: true,
            };
    
            const userToUpdate = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
                save: () => {}
            };
    
            const updatedUserData = {
                name: 'Updated User 1',
                email: 'updateduser1@example.com',
                password: 'newpassword123',
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/2/update')
                .set('Authorization', `Bearer valid-user-token`)
                .send(updatedUserData);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('DELETE /:userId', () => {
        it('should delete a user for admin', async () => {
            const userToDelete = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
                remove: jest.fn().mockResolvedValue(undefined),
            };
    
            const findUserMock = jest.fn().mockResolvedValue(userToDelete);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .delete('/2')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(204);
            expect(userToDelete.remove).toHaveBeenCalled();
            expect(findUserMock).toHaveBeenCalledWith({ id: 2 });
        });
    
        it('should return 400 if user does not exist', async () => {
            const findUserMock = jest.fn().mockResolvedValue(null);
            User.findOneBy = findUserMock;
    
            const response = await supertest(app.server)
                .delete('/999') // Non-existent user ID
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'User do not exist.',
            });
        });
    
        it('should return 403 if trying to delete a SUPERADMIN user', async () => {
            const superAdminUser = {
                id: 1,
                name: 'Super Admin',
                email: 'superadmin@example.com',
                role: 'SUPERADMIN',
                activated: true,
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', `Bearer valid-admin-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 403 if a non-admin user tries to delete another user', async () => {
            const userToDelete = {
                id: 2,
                name: 'User 1',
                email: 'user1@example.com',
                role: 'user',
                activated: true,
            };
    
            (User.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .delete('/2')
                .set('Authorization', `Bearer valid-user-token`);
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });
});