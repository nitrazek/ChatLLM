import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/chats_schemas";
import { userAuth } from "../services/authentication_service";
import { Chat } from "../models/chat";
import { ChatMessage } from "../models/chat_message";
import { BadRequestError, ForbiddenError } from "../schemas/errors_schemas";
import { getRagTemplate } from "../prompts";
import { SenderType } from "../enums/sender_type";
import { getRagChain, transformStream } from "../utils/stream_handler";

const chatsRoutes: FastifyPluginCallback = (server, _, done) => {
    // Create a new chat
    server.post<{
        Body: Schemas.CreateChatBody,
        Reply: Schemas.CreateChatResponse
    }>('/new', {
        schema: Schemas.CreateChatSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const { name, isUsingOnlyKnowledgeBase } = req.body;
        const chat = Chat.create({
            name,
            isUsingOnlyKnowledgeBase,
            user: req.user
        });
        await chat.save();
        reply.send(chat);
    });

    // Send a message to specific chat
    server.post<{
        Params: Schemas.SendMessageParams,
        Body: Schemas.SendMessageBody,
        Response: Schemas.SendMessageResponse
    }>('/:chatId', {
        schema: Schemas.SendMessageSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const chat = await Chat.findOne({
            where: { id: req.params.chatId },
            relations: ["user"]
        });
        if (!chat) throw new BadRequestError('Chat do not exist.');
        if (chat.user.id !== req.user.id) throw new ForbiddenError('You do not have permission to access this resource.');

        const template = getRagTemplate(chat.isUsingOnlyKnowledgeBase);
        const question = req.body.question;
        const [chatMessageList, _] = await ChatMessage.findAndCount({
            take: 10,
            where: { chat: { id: chat.id } }
        });
        await chat.addMessage(SenderType.HUMAN, question);

        const ragChain = getRagChain(template, chatMessageList);
        const stream = await ragChain.stream({ question });
        return reply.send(transformStream(stream, chat));
    });

    // Get a list of chats for a specific user
    server.get<{
        Querystring: Schemas.GetChatListQuery,
        Reply: Schemas.GetChatListResponse
    }>('/list', {
        schema: Schemas.GetChatListSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const { page = 1, limit = 20 } = req.query;
        
        const [chats, _] = await Chat.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                user: { id: req.user.id }
            }
        });

        const totalMessages = await Chat.count();
        const totalPages = Math.ceil(totalMessages / limit);
        const paginationMetadata = {
            totalPages: totalPages,
            currentPage: page,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        }

        reply.send({
            chats: chats,
            pagination: paginationMetadata
        });
    });

    // Get specific chat history
    server.get<{
        Params: Schemas.GetChatMessagesParams,
        Querystring: Schemas.GetChatMessagesQuery,
        Reply: Schemas.GetChatMessagesResponse
    }>('/:chatId', {
        schema: Schemas.GetChatMessagesSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const chat = await Chat.findOne({
            where: { id: req.params.chatId },
            relations: ["user"]
        });
        if (!chat) throw new BadRequestError('Chat do not exist.');
        if (chat.user.id !== req.user.id) throw new ForbiddenError('You do not have permission to access this resource.');

        const { page = 1, limit = 20 } = req.query;
        const [messages, _] = await ChatMessage.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                chat: {
                    id: req.params.chatId
                }
            }
        });

        reply.send(messages);
    });

    // Change datails of specific chat
    server.put<{
        Params: Schemas.UpdateChatParams,
        Body: Schemas.UpdateChatBody,
        Reply: Schemas.UpdateChatResponse
    }>('/:chatId', {
        schema: Schemas.UpdateChatSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const chat = await Chat.findOne({
            where: { id: req.params.chatId },
            relations: ["user"]
        });
        if (!chat) throw new BadRequestError('Chat do not exist.');
        if (chat.user.id !== req.user.id) throw new ForbiddenError('You do not have permission to access this resource.');

        const { name, isUsingOnlyKnowledgeBase } = req.body;
        if (!name && !isUsingOnlyKnowledgeBase) throw new BadRequestError('Need at least 1 parameter to change.');

        await Chat.update({ id: req.params.chatId }, { name, isUsingOnlyKnowledgeBase });
        await chat.reload();
        reply.send(chat);
    });

    // Delete specific chat
    server.delete<{
        Params: Schemas.DeleteChatParams,
        Reply: Schemas.DeleteChatResponse
    }>('/:chatId', {
        schema: Schemas.UpdateChatSchema,
        onRequest:[userAuth(server)]
    }, async (req, reply) => {
        const chat = await Chat.findOne({
            where: { id: req.params.chatId },
            relations: ["user"]
        });
        if (!chat) throw new BadRequestError('Chat do not exist.');
        if (chat.user.id !== req.user.id) throw new ForbiddenError('You do not have permission to access this resource.');
    
        await Chat.delete({ id: req.params.chatId });
        reply.code(204).send();
    });

    done();
};

export default chatsRoutes;
