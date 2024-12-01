import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { ChatOwnerGuardedResponseSchema, UserGuardedResponseSchema } from "./errors_schemas";
import { SenderType } from "../enums/sender_type";
import { AuthHeaderTypes, PaginationMetadataTypes } from "./base_schemas";

//////////////////// Generic Schemas ////////////////////

// Schema for generic chat response
const GenericChatResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the chat" }),
    name: Type.String({ description: "Name of the chat" }),
    isUsingOnlyKnowledgeBase: Type.Boolean({ description: "Flag indicating if the chat uses only the knowledge base" }),
    createdAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Creation date of the chat" }),
    updatedAt: Type.Unsafe<Date>({ type: 'string', format: 'date', description: "Update date of the chat" })
}, { description: "Basic information about a chat" });

// Schema for generic chat message response
const GenericChatMessageResponseTypes = Type.Object({
    id: Type.Number({ description: "Unique identifier of the message" }),
    sender: Type.Enum(SenderType, { description: "The sender type (user or system)" }),
    content: Type.String({ description: "Content of the message" })
}, { description: "Basic information about a chat message" });

//////////////////// Schema for POST requests ////////////////////

// Schema for creating a new chat
const CreateChatBodyTypes = Type.Object({
    name: Type.Optional(Type.String({ description: "Optional name for the chat" })),
    isUsingOnlyKnowledgeBase: Type.Optional(Type.Boolean({ description: "Whether the chat uses only the knowledge base" }))
}, { description: "Payload to create a new chat" });
export type CreateChatBody = Static<typeof CreateChatBodyTypes>;

const CreateChatResponseTypes = Type.Object({
    ...GenericChatResponseTypes.properties
}, { description: "Response containing the newly created chat" });
export type CreateChatResponse = Static<typeof CreateChatResponseTypes>;

export const CreateChatSchema: FastifySchema = {
    summary: "Create a new chat",
    description: "Creates a new chat for the authenticated user.",
    headers: AuthHeaderTypes,
    body: CreateChatBodyTypes,
    tags: ["Chats"],
    response: {
        200: CreateChatResponseTypes,
        ...UserGuardedResponseSchema
    }
};

// Schema for sending a message to existing chat
const SendMessageParamsTypes = Type.Object({
    chatId: Type.Number({ description: "ID of the chat to send the message to" })
}, { description: "Parameters to identify the chat" });
export type SendMessageParams = Static<typeof SendMessageParamsTypes>;

const SendMessageBodyTypes = Type.Object({
    question: Type.String({ description: "The message content" })
}, { description: "Payload containing the message to be sent" });
export type SendMessageBody = Static<typeof SendMessageBodyTypes>;

const SendMessageResponseTypes = Type.Array(Type.Object({
    answer: Type.String({ description: "Answer chunk" }),
    newChatName: Type.Optional(Type.String({ description: "New generated chat name, sent in last chunk if question was sent to chat without name" }))
}), { description: "Response after sending a message in form of stream" });
export type SendMessageResponse = Static<typeof SendMessageResponseTypes>;

export const SendMessageSchema: FastifySchema = {
    summary: "Send a message",
    description: "Sends a message to a specific chat. The user must be the owner of the chat.",
    headers: AuthHeaderTypes,
    params: SendMessageParamsTypes,
    body: SendMessageBodyTypes,
    tags: ["Chats"],
    response: {
        200: SendMessageResponseTypes,
        ...ChatOwnerGuardedResponseSchema
    }
};


//////////////////// Schemas for GET requests ////////////////////

// Schema for getting a list of chats for a specific user
const GetChatListQueryTypes = Type.Object({
    page: Type.Optional(Type.Number({ description: "The page number for pagination" })),
    limit: Type.Optional(Type.Number({ description: "The number of chats to retrieve per page" })),
    order: Type.Optional(Type.String({ description: "Sort order for the list of chats (Default DESC)" }))
}, { description: "Query parameters for paginated chat list retrieval" });
export type GetChatListQuery = Static<typeof GetChatListQueryTypes>;

const GetChatListResponseTypes = Type.Object({
    chats: Type.Array(Type.Object({
        ...GenericChatResponseTypes.properties
    }), { description: "List of chats for the user" }),
    pagination: PaginationMetadataTypes
}, { description: "List of chats for the user in desc order by updated time with pagination metadata" });
export type GetChatListResponse = Static<typeof GetChatListResponseTypes>;

export const GetChatListSchema: FastifySchema = {
    summary: "Get list of chats",
    description: "Retrieves a paginated list of chats for the authenticated user.",
    headers: AuthHeaderTypes,
    querystring: GetChatListQueryTypes,
    tags: ["Chats"],
    response: {
        200: GetChatListResponseTypes,
        ...UserGuardedResponseSchema
    }
}

// Schema for getting chat messages
const GetChatMessagesParamsTypes = Type.Object({
    chatId: Type.Number({ description: "ID of the chat to retrieve messages from" })
}, { description: "Parameters to identify the chat" });
export type GetChatMessagesParams = Static<typeof GetChatMessagesParamsTypes>;

const GetChatMessagesQueryTypes = Type.Object({
    page: Type.Optional(Type.Number({ description: "The page number for pagination" })),
    limit: Type.Optional(Type.Number({ description: "The number of messages to retrieve per page" })),
    order: Type.Optional(Type.String({ description: "Sort order for the list of messages (Default DESC)" }))
}, { description: "Query parameters for paginated message retrieval" });
export type GetChatMessagesQuery = Static<typeof GetChatMessagesQueryTypes>;

const GetChatMessagesResponseTypes = Type.Object({
    messages: Type.Array(Type.Object({
        ...GenericChatMessageResponseTypes.properties
    }), { description: "List of chat messages for the chat" }),
    pagination: PaginationMetadataTypes
}, { description: "List of chat messages for the chat in desc order by updated time with pagination metadata" });
export type GetChatMessagesResponse = Static<typeof GetChatMessagesResponseTypes>;

export const GetChatMessagesSchema: FastifySchema = {
    summary: "Get chat messages",
    description: "Retrieves a paginated list of messages for a specific chat. The user must be the owner of the chat.",
    headers: AuthHeaderTypes,
    params: GetChatMessagesParamsTypes,
    querystring: GetChatMessagesQueryTypes,
    tags: ["Chats"],
    response: {
        200: GetChatMessagesResponseTypes,
        ...ChatOwnerGuardedResponseSchema
    }
}


//////////////////// Schemas for PUT requests ////////////////////

// Schema for changing chat details
const UpdateChatParamsTypes = Type.Object({
    chatId: Type.Number({ description: "ID of the chat to update" })
}, { description: "Parameters to identify the chat to update" });
export type UpdateChatParams = Static<typeof UpdateChatParamsTypes>;

const UpdateChatBodyTypes = Type.Object({
    name: Type.Optional(Type.String({ description: "The new name for the chat" })),
    isUsingOnlyKnowledgeBase: Type.Optional(Type.Boolean({ description: "Whether the chat should only use the knowledge base" }))
}, { description: "Payload containing the updated chat details" });
export type UpdateChatBody = Static<typeof UpdateChatBodyTypes>;

const UpdateChatResponseTypes = Type.Object({
    ...GenericChatResponseTypes.properties
}, { description: "Response containing the updated chat details" });
export type UpdateChatResponse = Static<typeof UpdateChatResponseTypes>;

export const UpdateChatSchema: FastifySchema = {
    summary: "Update chat details",
    description: "Updates the name or settings of a specific chat. The user must be the owner of the chat.",
    headers: AuthHeaderTypes,
    params: UpdateChatParamsTypes,
    body: UpdateChatBodyTypes,
    tags: ["Chats"],
    response: {
        200: UpdateChatResponseTypes,
        ...ChatOwnerGuardedResponseSchema
    }
};


//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a chat
const DeleteChatParamsTypes = Type.Object({
    chatId: Type.Number({ description: "ID of the chat to delete" })
}, { description: "Parameters to identify the chat to delete" });
export type DeleteChatParams = Static<typeof DeleteChatParamsTypes>;

const DeleteChatResponseTypes = Type.Object({

}, { description: "Empty response for a successful chat deletion" });
export type DeleteChatResponse = Static<typeof DeleteChatResponseTypes>;

export const DeleteChatSchema: FastifySchema = {
    summary: "Delete chat",
    description: "Deletes a specific chat. The user must be the owner of the chat.",
    headers: AuthHeaderTypes,
    params: DeleteChatParamsTypes,
    tags: ["Chats"],
    response: {
        204: DeleteChatResponseTypes,
        ...ChatOwnerGuardedResponseSchema
    }
}
