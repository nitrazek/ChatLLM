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
import filesRoutes from '../routes/files_routes';
import { FileType } from '../enums/file_type';
import { ChromaService } from '../services/chroma_service';
import { File } from '../models/file';
import multipart from '@fastify/multipart';

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

jest.mock('../models/file');
jest.mock('../services/chroma_service.ts');
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
jest.mock('../utils/files_handlers.ts', () => {
    const originalModule = jest.requireActual('../utils/files_handlers.ts');
    return {
        __esModule: true,
        ...originalModule,
        resolveFileMimetype: jest.fn(() => [() => "Splitted document", FileType.TXT])
    };
});

describe('Files Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        await app.register(errorsService);
        await app.register(multipart);
        await app.register(filesRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    describe('POST /upload', () => {
        it('should upload a valid file and return metadata', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 1,
                type: FileType.FOLDER,
                save: () => {}
            }));
            (File.create as jest.Mock).mockImplementation((fileData) => ({
                ...fileData,
                id: 2,
                createdAt: createdAt,
                updatedAt: updatedAt,
                save: () => ({
                    ...fileData,
                    id: 2,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                })
            }));
            (ChromaService.getInstance as jest.Mock).mockImplementation(() => ({
                addDocuments: () => {}
            }));
    
            const response = await supertest(app.server)
                .post('/upload?folderId=1')
                .set('Authorization', 'Bearer valid-admin-token')
                .attach('file', Buffer.from('File content'), 'example.txt');
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                name: 'example',
                type: FileType.TXT,
                parentId: 1,
                chunkAmount: 1,
            });
        });
    
        it('should return 400 for invalid folder ID', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 1
            }));

            const response = await supertest(app.server)
                .post('/upload?folderId=1')
                .set('Authorization', 'Bearer valid-admin-token')
                .attach('file', Buffer.from('File content'), 'example.txt');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid folder ID',
            });
        });
    
        it('should return 403 if non-admin tries to upload a file', async () => {
            (File.create as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });

            const response = await supertest(app.server)
                .post('/upload')
                .set('Authorization', 'Bearer valid-user-token') // Non-admin token
                .attach('file', Buffer.from('File content'), 'example.txt');
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('POST /folders/new', () => {
        it('should create a folder and return metadata', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 1,
                type: FileType.FOLDER,
                save: () => {}
            }));
    
            (File.create as jest.Mock).mockImplementation((folderData) => ({
                ...folderData,
                id: 3,
                createdAt: createdAt,
                updatedAt: updatedAt,
                save: jest.fn(() => ({
                    ...folderData,
                    id: 3,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                }))
            }));
    
            const response = await supertest(app.server)
                .post('/folders/new')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'New Folder',
                    parentFolderId: 1
                });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 3,
                name: 'New Folder',
                type: FileType.FOLDER,
                parentId: 1,
                creatorName: testUser.name,
            });
        });
    
        it('should return 400 for invalid parent folder ID', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 1,
                type: FileType.TXT,
                save: () => {}
            }));
    
            const response = await supertest(app.server)
                .post('/folders/new')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({
                    name: 'Invalid Folder',
                    parentFolderId: 1
                });
                
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid parent folder ID',
            });
        });
    
        it('should return 403 if non-admin tries to create a folder', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .post('/folders/new')
                .set('Authorization', 'Bearer valid-user-token') // Non-admin token
                .send({
                    name: 'Unauthorized Folder',
                    parentFolderId: 1
                });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('GET /list', () => {
        it('should return a list of files with valid query parameters', async () => {
            (File.findAndCount as jest.Mock).mockImplementation(() => ([
                [
                    {
                        id: 1,
                        name: "File1",
                        type: FileType.TXT,
                        parent: null,
                        creator: { name: "AdminUser" },
                        createdAt,
                        updatedAt,
                        chunkAmount: 2
                    },
                    {
                        id: 2,
                        name: "File2",
                        type: FileType.FOLDER,
                        parent: { id: null },
                        creator: { name: "AdminUser" },
                        createdAt,
                        updatedAt,
                        chunkAmount: 2
                    }
                ],
                2 // Total file count
            ]));
    
            const response = await supertest(app.server)
                .get('/list?page=1&limit=10&order=ASC')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                files: [
                    {
                        id: 1,
                        name: "File1",
                        type: FileType.TXT,
                        parentId: null,
                        creatorName: "AdminUser",
                    },
                    {
                        id: 2,
                        name: "File2",
                        type: FileType.FOLDER,
                        parentId: null,
                        creatorName: "AdminUser",
                    }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    prevPage: null,
                    nextPage: null
                }
            });
        });
    
        it('should return 400 for an invalid page number', async () => {
            const response = await supertest(app.server)
                .get('/list?page=-1&limit=10&order=ASC')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be negative',
            });
        });
    
        it('should return 400 for an invalid folder ID', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 1,
                type: FileType.TXT,
                save: () => {}
            }));
    
            const response = await supertest(app.server)
                .get('/list?folderId=999&page=1&limit=10&order=ASC')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid folder ID',
            });
        });
    
        it('should return 400 for an invalid order value', async () => {
            const response = await supertest(app.server)
                .get('/list?page=1&limit=10&order=INVALID')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: "Invalid order value, must be either 'ASC' or 'DESC'",
            });
        });
    
        it('should return 400 for an invalid type value', async () => {
            const response = await supertest(app.server)
                .get('/list?page=1&limit=10&type=INVALID')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid type value',
            });
        });
    
        it('should return 403 if a non-admin user tries to access the list', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
            
            const response = await supertest(app.server)
                .get('/list?page=1&limit=10&order=ASC&folderId=1')
                .set('Authorization', 'Bearer valid-user-token');
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    
        it('should return 400 if the requested page exceeds total pages', async () => {
            (File.findAndCount as jest.Mock).mockImplementation(() => ([
                [],
                2 // Total file count
            ]));
    
            const response = await supertest(app.server)
                .get('/list?page=10&limit=10&order=ASC')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid page number, must not be greater than page amount',
            });
        });
    });

    describe('GET /:fileId', () => {
        it('should return file content and metadata for a valid file ID (admin only)', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => ({
                id: 2,
                name: 'example.txt',
                type: FileType.TXT,
                parent: { id: 1 },
                creator: { name: 'Admin User' },
                createdAt,
                updatedAt,
                chunkAmount: 2
            }));
            (ChromaService.getInstance as jest.Mock).mockImplementation(() => ({
                getFileContent: jest.fn(() => 'File content here.')
            }));
    
            const response = await supertest(app.server)
                .get('/2')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 2,
                name: 'example.txt',
                type: FileType.TXT,
                parentId: 1,
                creatorName: 'Admin User',
                content: 'File content here.',
            });
        });
    
        it('should return 400 for a non-existent file ID', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => null);
    
            const response = await supertest(app.server)
                .get('/999')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'File do not exist.',
            });
        });
    
        it('should return 403 if a non-admin user attempts to access the file', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });

            (userAuth as jest.Mock).mockImplementation(() => (req: any, reply: any) => {
                req.user = { ...testUser, role: UserRole.USER }; // Mock as non-admin
                return Promise.resolve();
            });
    
            const response = await supertest(app.server)
                .get('/2')
                .set('Authorization', 'Bearer valid-user-token');
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('PUT /:fileId', () => {
        it('should update the file details for a valid file ID (admin only)', async () => {
            const fileMock = {
                id: 2,
                name: 'example.txt',
                type: FileType.TXT,
                parent: { id: 1 },
                creator: { name: 'Admin User' },
                createdAt,
                updatedAt,
                chunkAmount: 2,
                save: jest.fn().mockResolvedValue({
                    id: 2,
                    name: 'updated-example.txt',
                    type: FileType.TXT,
                    parent: { id: 1 },
                    creator: { name: 'Admin User' },
                    createdAt,
                    updatedAt,
                    chunkAmount: 2
                }),
            };
            (File.findOne as jest.Mock).mockResolvedValue(fileMock);
    
            const response = await supertest(app.server)
                .put('/2')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'updated-example.txt' });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 2,
                name: 'updated-example.txt',
                type: FileType.TXT,
                parentId: 1,
                creatorName: 'Admin User',
            });
            expect(fileMock.save).toHaveBeenCalled();
        });
    
        it('should return 400 for a non-existent file ID', async () => {
            (File.findOne as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .put('/999')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ name: 'new-name.txt' });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'File do not exist.',
            });
        });

        it('should return 403 if a non-admin user attempts to update the file', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/2')
                .set('Authorization', 'Bearer valid-user-token')
                .send({ name: 'new-name.txt' });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('PUT /move/:fileId', () => {
        it('should move the file to a new folder for a valid file ID and folder ID (admin only)', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => ({
                id: 2,
                type: FileType.TXT,
                name: 'example.txt',
                parent: { id: 3 },
                creator: { name: 'Admin User' },
                createdAt,
                updatedAt,
                chunkAmount: 2,
                save: jest.fn().mockResolvedValue({
                    id: 2,
                    type: FileType.TXT,
                    name: 'example.txt',
                    parent: { id: 3 },
                    creator: { name: 'Admin User' },
                    createdAt,
                    updatedAt,
                    chunkAmount: 2
                }),
            }));
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 3,
                type: FileType.FOLDER,
                save: () => {}
            }));
            (File.merge as jest.Mock).mockImplementation(() => ({
                id: 2,
                name: 'example.txt',
                parent: { id: 3 },
                creator: { name: 'Admin User' },
                createdAt,
                updatedAt,
                chunkAmount: 2,
                save: jest.fn().mockResolvedValue({
                    id: 2,
                    name: 'example.txt',
                    parent: { id: 3 },
                    creator: { name: 'Admin User' },
                    createdAt,
                    updatedAt,
                    chunkAmount: 2
                }),
            }));
    
            const response = await supertest(app.server)
                .put('/move/2')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ newParentFolderId: 3 });
    
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 2,
                name: 'example.txt',
                parentId: 3,
                creatorName: 'Admin User',
            });
        });
    
        it('should return 400 for a non-existent file ID', async () => {
            (File.findOne as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .put('/move/999')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ newParentFolderId: 3 });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'File do not exist.',
            });
        });
    
        it('should return 400 for an invalid folder ID', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => ({
                id: 3,
                type: FileType.TXT,
                save: () => {}
            }));
            const fileMock = {
                id: 2,
                name: 'example.txt',
                parent: { id: 1 },
                creator: { name: 'Admin User' },
                createdAt,
                updatedAt,
                save: jest.fn(),
            };
            (File.findOne as jest.Mock).mockResolvedValue(fileMock);
    
            const response = await supertest(app.server)
                .put('/move/2')
                .set('Authorization', 'Bearer valid-admin-token')
                .send({ newParentFolderId: 3 });
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid folder ID',
            });
        });
    
        it('should return 403 if a non-admin user attempts to move the file', async () => {
            (File.findOne as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .put('/move/2')
                .set('Authorization', 'Bearer valid-user-token')
                .send({ newParentFolderId: 3 });
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });

    describe('DELETE /:fileId', () => {
        it('should delete the file for a valid file ID (admin only)', async () => {
            const fileMock = {
                id: 1,
                name: 'example.txt',
                remove: jest.fn().mockResolvedValue(undefined),
            };
            const chromaServiceMock = {
                deleteFile: jest.fn().mockResolvedValue(undefined),
            };
    
            (File.findOneBy as jest.Mock).mockResolvedValue(fileMock);
            (ChromaService.getInstance as jest.Mock).mockResolvedValue(chromaServiceMock);
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(204);
            expect(fileMock.remove).toHaveBeenCalled();
            expect(chromaServiceMock.deleteFile).toHaveBeenCalledWith(fileMock);
        });
    
        it('should return 400 for a non-existent file ID', async () => {
            (File.findOneBy as jest.Mock).mockResolvedValue(null);
    
            const response = await supertest(app.server)
                .delete('/999')
                .set('Authorization', 'Bearer valid-admin-token');
    
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'File do not exist.',
            });
        });
    
        it('should return 403 if a non-admin user attempts to delete a file', async () => {
            (File.findOneBy as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });
    
            const response = await supertest(app.server)
                .delete('/1')
                .set('Authorization', 'Bearer valid-user-token');
    
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                statusCode: 403,
                error: 'Forbidden',
                message: '',
            });
        });
    });
});