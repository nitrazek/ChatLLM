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

jest.mock('../models/chat');
jest.mock('../models/chat_message');
jest.mock('../services/authentication_service.ts', () => {
    const originalModule = jest.requireActual('../services/authentication_service.ts');
    return {
        __esModule: true,
        ...originalModule,
        userAuth: jest.fn(() => (req: any, reply: any) => {
            req.user = testUser
            return Promise.resolve()
        })
    };
});
jest.mock('../utils/stream_handler.ts', () => ({
    getRagChain: jest.fn(() => ({
        stream: jest.fn(() => Promise.resolve(['response'])),
    })),
    transformStream: jest.fn((stream, chat) => Promise.resolve('transformed response'))
}));

describe('Chats Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        await app.register(errorsService);
        await app.register(chatsRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    describe('POST /new', () => {
        it('should create a new chat and return the chat details', async () => {
            // Mock the Chat.create and Chat.save methods
            (Chat.create as jest.Mock).mockImplementation((chatData) => ({
                ...chatData,
                id: 1,
                user: testUser,
                createdAt: createdAt,
                updatedAt: updatedAt,
                save: () => {}
            }));
    
            const response = await supertest(app.server)
                .post('/new')
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
                .send({
                    name: "test",
                    isUsingOnlyKnowledgeBase: true,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                name: "test",
                isUsingOnlyKnowledgeBase: true,
                createdAt: createdAt,
                updatedAt: updatedAt
            });
            expect(Chat.create).toHaveBeenCalledWith({
                name: "test",
                isUsingOnlyKnowledgeBase: true,
                user: testUser
            });
        });
    
        it('should return 400 if request body is invalid', async () => {
            (Chat.create as jest.Mock).mockImplementation(() => {
                throw [new ValidationError()]
            });
            
            const response = await supertest(app.server)
                .post('/new')
                .set('Authorization', 'Bearer mock-token')
                .send({});
    
            expect(response.statusCode).toBe(400);
        });
    });

    describe('POST /:chatId', () => {
        it('should send a message and return a transformed response', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
                isUsingOnlyKnowledgeBase: true,
                addMessage: jest.fn(() => Promise.resolve()),
            };
    
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
    
            // Mock ChatMessage.findAndCount
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]);
    
            const response = await supertest(app.server)
                .post('/1')
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
                .send({
                    question: 'What is the capital of France?',
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({});
            expect(mockChat.addMessage).toHaveBeenCalledWith(SenderType.HUMAN, 'What is the capital of France?');
        });
    
        it('should return 400 if the chat does not exist', async () => {
            // Mock Chat.findOne to return null
            (Chat.findOne as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .post('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    question: 'What is the capital of France?',
                });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Chat do not exist.',
            });
        });
    
        it('should return 403 if the user does not have access to the chat', async () => {    
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .post('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    question: 'What is the capital of France?',
                });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 500 if unexpected error', async () => {
            // Mock Chat.findOne to throw an error
            (Chat.findOne as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
    
            const response = await supertest(app.server)
                .post('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    question: 'What is the capital of France?',
                });
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Unexpected error',
            });
        });
    });

    describe('GET /list', () => {
        it('should return a list of chats with pagination metadata', async () => {
            // Mock the Chat.findAndCount method to return a list of chats
            (Chat.findAndCount as jest.Mock).mockResolvedValue([
                [{ id: 1, name: 'Test Chat', isUsingOnlyKnowledgeBase: true, user: testUser, createdAt: createdAt, updatedAt: updatedAt }],
                1, // totalChats
            ]);
            
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('chats');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.chats).toHaveLength(1); // One chat should be returned
            expect(response.body.pagination).toHaveProperty('currentPage', 1);
            expect(response.body.pagination).toHaveProperty('totalPages', 1);
        });
    
        it('should return 400 if the page number is invalid', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: -1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be negative',
            });
        });
    
        it('should return 400 if the limit value is invalid', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: -5, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid limit value, must not be negative',
            });
        });
    
        it('should return 400 if the order value is invalid', async () => {
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'INVALID' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid order value, must be either \'ASC\' or \'DESC\'',
            });
        });
    
        it('should return 400 if the page number is greater than the total pages', async () => {
            // Mock the Chat.findAndCount method to simulate invalid page number
            (Chat.findAndCount as jest.Mock).mockResolvedValue([
                [{ id: 1, name: 'Test Chat', user: testUser, createdAt: createdAt, updatedAt: updatedAt }],
                1, // totalChats
            ]);
            
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 2, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be greater than page amount',
            });
        });
    
        it('should return an empty list if no chats are found', async () => {
            // Mock the Chat.findAndCount method to return no chats
            (Chat.findAndCount as jest.Mock).mockResolvedValue([[], 0]);
            
            const response = await supertest(app.server)
                .get('/list')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.chats).toHaveLength(0);
            expect(response.body.pagination).toHaveProperty('currentPage', 1);
            expect(response.body.pagination).toHaveProperty('totalPages', 1);
        });
    });

    describe('GET /:chatId', () => {
        it('should return chat history with pagination metadata', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
                isUsingOnlyKnowledgeBase: true,
            };
    
            const mockMessages = [
                { id: 1, content: 'Hello', sender: SenderType.HUMAN, createdAt },
                { id: 2, content: 'How are you?', sender: SenderType.AI, createdAt },
            ];
    
            const mockPagination = {
                currentPage: 1,
                totalPages: 1,
            };
    
            // Mock Chat.findOne to return the chat
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
    
            // Mock ChatMessage.findAndCount to return the messages and pagination metadata
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([mockMessages, 2]);
    
            const response = await supertest(app.server)
                .get('/1') // using chatId = 1
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('messages');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.messages).toHaveLength(2); // Two messages should be returned
            expect(response.body.pagination).toHaveProperty('currentPage', 1);
            expect(response.body.pagination).toHaveProperty('totalPages', 1);
        });
    
        it('should return 400 if chat does not exist', async () => {
            (Chat.findOne as jest.Mock).mockResolvedValue(null); // Mock that chat doesn't exist
    
            const response = await supertest(app.server)
                .get('/1') // using chatId = 1
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Chat do not exist.',
            });
        });
    
        it('should return 403 if user does not have permission to access the chat', async () => {
            const mockChat = {
                id: 1,
                user: { id: 2 }, // User id does not match the authenticated user
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource.',
            });
        });
    
        it('should return 400 if page number is invalid', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]); // No messages for simplicity
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: -1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be negative',
            });
        });
    
        it('should return 400 if limit value is invalid', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]); // No messages for simplicity
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: -5, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid limit value, must not be negative',
            });
        });
    
        it('should return 400 if order value is invalid', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]); // No messages for simplicity
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'INVALID' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid order value, must be either \'ASC\' or \'DESC\'',
            });
        });
    
        it('should return 400 if page number is greater than total pages', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]); // No messages for simplicity
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 2, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be greater than page amount',
            });
        });
    
        it('should return an empty list if no messages are found', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
            };
    
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (ChatMessage.findAndCount as jest.Mock).mockResolvedValue([[], 0]);
    
            const response = await supertest(app.server)
                .get('/1')
                .set('Authorization', 'Bearer mock-token')
                .query({ page: 1, limit: 20, order: 'ASC' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.messages).toHaveLength(0);
            expect(response.body.pagination).toHaveProperty('currentPage', 1);
            expect(response.body.pagination).toHaveProperty('totalPages', 1);
        });
    });

    describe('PUT /:chatId', () => {
        it('should update chat details and return the updated chat', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
                name: 'Old Chat Name',
                isUsingOnlyKnowledgeBase: false,
                save: jest.fn(() => Promise.resolve({
                    id: 1,
                    name: 'Updated Chat Name',
                    isUsingOnlyKnowledgeBase: true,
                    user: testUser,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                })),
            };
    
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
    
            const response = await supertest(app.server)
                .put('/1')
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
                .send({
                    name: 'Updated Chat Name',
                    isUsingOnlyKnowledgeBase: true,
                });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                name: 'Updated Chat Name',
                isUsingOnlyKnowledgeBase: true,
                createdAt: createdAt,
                updatedAt: updatedAt,
            });
            expect(mockChat.save).toHaveBeenCalled();
        });
    
        it('should return 400 if the chat does not exist', async () => {
            // Mock Chat.findOne to return null
            (Chat.findOne as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .put('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    name: 'Updated Chat Name',
                    isUsingOnlyKnowledgeBase: true,
                });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Chat do not exist.',
            });
        });
    
        it('should return 403 if the user does not have permission to update the chat', async () => {
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                user: { id: 2 }, // Different user
            });
    
            const response = await supertest(app.server)
                .put('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    name: 'Updated Chat Name',
                    isUsingOnlyKnowledgeBase: true,
                });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource.',
            });
        });
    
        it('should return 400 if the request body is invalid', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
                name: 'Old Chat Name',
                isUsingOnlyKnowledgeBase: false,
                save: jest.fn(),
            };
    
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
            (Chat.merge as jest.Mock).mockImplementation(() => {
                throw [new ValidationError()]
            })
    
            const response = await supertest(app.server)
                .put('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({}); // Send invalid body
    
            expect(response.statusCode).toBe(400);
        });
    
        it('should return 500 if unexpected error occurs while updating', async () => {
            // Mock Chat.findOne to throw an error
            (Chat.findOne as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
    
            const response = await supertest(app.server)
                .put('/1')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    name: 'Updated Chat Name',
                    isUsingOnlyKnowledgeBase: true,
                });
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Unexpected error',
            });
        });
    });

    describe('DELETE /:chatId', () => {
        it('should delete the chat successfully', async () => {
            const mockChat = {
                id: 1,
                user: testUser,
                name: 'Chat to be deleted',
                isUsingOnlyKnowledgeBase: false,
                remove: jest.fn(() => Promise.resolve()),
            };
    
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue(mockChat);
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer mock-token') // Simulate token authentication
    
            expect(response.statusCode).toBe(204);
            expect(mockChat.remove).toHaveBeenCalled();
        });
    
        it('should return 400 if the chat does not exist', async () => {
            // Mock Chat.findOne to return null
            (Chat.findOne as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Chat do not exist.',
            });
        });
    
        it('should return 403 if the user does not have permission to delete the chat', async () => {
            // Mock Chat.findOne
            (Chat.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                user: { id: 2 }, // Different user
            });
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource.',
            });
        });
    
        it('should return 500 if unexpected error occurs while deleting the chat', async () => {
            // Mock Chat.findOne to throw an error
            (Chat.findOne as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer mock-token');
    
            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Unexpected error',
            });
        });
    });
});