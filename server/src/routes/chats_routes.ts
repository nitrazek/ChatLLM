import { FastifyPluginCallback } from "fastify";
import * as Schemas from "../schemas/chats_schemas";
import { userAuth } from "../services/authentication_service";
import { Chat } from "../models/chat";
import { ChatMessage } from "../models/chat_message";
import { BadRequestError, ForbiddenError } from "../schemas/errors_schemas";
import { getRagTemplate } from "../prompts";
import { SenderType } from "../enums/sender_type";
import { getRagChain, transformStream } from "../utils/stream_handler";
import { getPaginationMetadata } from "../utils/pagination_handler";

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
        if(page < 1) throw new BadRequestError("Invalid page number, must not be negative");
        if(limit < 1) throw new BadRequestError("Invalid limit value, must not be negative");

        const [chats, totalChats] = await Chat.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { user: { id: req.user.id } }
        });

        const paginationMetadata = getPaginationMetadata(page, limit, totalChats);
        if(paginationMetadata.currentPage > paginationMetadata.totalPages)
            throw new BadRequestError("Invalid page number, must not be greater than page amount");

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
        if(page < 1) throw new BadRequestError("Invalid page number, must not be negative");
        if(limit < 1) throw new BadRequestError("Invalid limit value, must not be negative");

        const [messages, totalMessages] = await ChatMessage.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { chat: { id: req.params.chatId } }
        });

        const paginationMetadata = getPaginationMetadata(page, limit, totalMessages);
        if(paginationMetadata.currentPage > paginationMetadata.totalPages)
            throw new BadRequestError("Invalid page number, must not be greater than page amount");

        reply.send({
            messages: messages,
            pagination: paginationMetadata
        });
    });

    // Change details of specific chat
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
