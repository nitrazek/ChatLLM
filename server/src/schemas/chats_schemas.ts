import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { UserGuardedResponseSchema } from "./errors_schemas";
import { SenderType } from "../enums/sender_type";

//////////////////// Generic Schemas ////////////////////

// Schema for generic chat response
const GenericChatResponseTypes = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    isUsingOnlyKnowledgeBase: Type.Boolean()
});

// Schema for generic chat message response
const GenericChatMessageResponseTypes = Type.Object({
    id: Type.Number(),
    sender: Type.Enum(SenderType),
    content: Type.String()
});

//////////////////// Schema for POST requests ////////////////////

// Schema for creating a new chat
const CreateChatBodyTypes = Type.Object({
    name: Type.Optional(Type.String()),
    isUsingOnlyKnowledgeBase: Type.Optional(Type.Boolean())
});
export type CreateChatBody = Static<typeof CreateChatBodyTypes>;

const CreateChatResponseTypes = Type.Object({
    ...GenericChatResponseTypes.properties
});
export type CreateChatResponse = Static<typeof CreateChatResponseTypes>;

export const CreateChatSchema: FastifySchema = {
    summary: "",
    description: "",
    body: CreateChatBodyTypes,
    tags: ["Chats"],
    response: {
        200: CreateChatResponseTypes,
        ...UserGuardedResponseSchema
    }
};

// Schema for sending a message to existing chat
const SendMessageParamsTypes = Type.Object({
    chatId: Type.Number()
});
export type SendMessageParams = Static<typeof SendMessageParamsTypes>;

const SendMessageBodyTypes = Type.Object({
    content: Type.String()
});
export type SendMessageBody = Static<typeof SendMessageBodyTypes>;

const SendMessageResponseTypes = Type.Array(Type.Object({

}));
export type SendMessageResponse = Static<typeof SendMessageResponseTypes>;

export const SendMessageSchema: FastifySchema = {
    summary: "",
    description: "",
    params: SendMessageParamsTypes,
    body: SendMessageBodyTypes,
    tags: ["Chats"],
    response: {
        200: SendMessageResponseTypes,
        ...UserGuardedResponseSchema
    }
};


//////////////////// Schemas for GET requests ////////////////////

// Schema for getting a list of chats for a specific user
const GetChatListParamsTypes = Type.Object({
    chatId: Type.Number()
});
export type GetChatListParams = Static<typeof GetChatListParamsTypes>;

const GetChatListQueryTypes = Type.Object({
    page: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number())
});
export type GetChatListQuery = Static<typeof GetChatListQueryTypes>;

const GetChatListResponseTypes = Type.Array(Type.Object({
    ...GenericChatResponseTypes.properties
}));
export type GetChatListResponse = Static<typeof GetChatListResponseTypes>;

export const GetChatListSchema: FastifySchema = {
    summary: "",
    description: "",
    params: GetChatListParamsTypes,
    querystring: GetChatListQueryTypes,
    tags: ["Chats"],
    response: {
        200: GetChatListResponseTypes,
        ...UserGuardedResponseSchema
    }
}

// Schema for getting chat messages
const GetChatMessagesParamsTypes = Type.Object({
    chatId: Type.Number()
});
export type GetChatMessagesParams = Static<typeof GetChatMessagesParamsTypes>;

const GetChatMessagesQueryTypes = Type.Object({
    page: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number())
});
export type GetChatMessagesQuery = Static<typeof GetChatMessagesQueryTypes>;

const GetChatMessagesResponseTypes = Type.Array(Type.Object({
    ...GenericChatMessageResponseTypes.properties
}));
export type GetChatMessagesResponse = Static<typeof GetChatMessagesResponseTypes>;

export const GetChatMessagesSchema: FastifySchema = {
    summary: "",
    description: "",
    params: GetChatMessagesParamsTypes,
    querystring: GetChatMessagesQueryTypes,
    tags: ["Chats"],
    response: {
        200: GetChatMessagesResponseTypes,
        ...UserGuardedResponseSchema
    }
}


//////////////////// Schemas for PUT requests ////////////////////

// Schema for changing chat details
const UpdateChatParamsTypes = Type.Object({
    chatId: Type.Number()
});
export type UpdateChatParams = Static<typeof UpdateChatParamsTypes>;

const UpdateChatBodyTypes = Type.Object({
    name: Type.Optional(Type.String()),
    isUsingOnlyKnowledgeBase: Type.Optional(Type.Boolean())
});
export type UpdateChatBody = Static<typeof UpdateChatBodyTypes>;

const UpdateChatResponseTypes = Type.Object({
    ...GenericChatResponseTypes.properties
});
export type UpdateChatResponse = Static<typeof UpdateChatResponseTypes>;

export const UpdateChatSchema: FastifySchema = {
    summary: "",
    description: "",
    params: UpdateChatParamsTypes,
    body: UpdateChatBodyTypes,
    tags: ["Chats"],
    response: {
        200: UpdateChatResponseTypes,
        ...UserGuardedResponseSchema
    }
};


//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a chat
const DeleteChatParamsTypes = Type.Object({
    chatId: Type.Number()
});
export type DeleteChatParams = Static<typeof DeleteChatParamsTypes>;

const DeleteChatResponseTypes = Type.Object({
});
export type DeleteChatResponse = Static<typeof DeleteChatResponseTypes>;

export const DeleteChatSchema: FastifySchema = {
    summary: "",
    description: "",
    params: DeleteChatParamsTypes,
    tags: ["Chats"],
    response: {
        204: DeleteChatResponseTypes,
        ...UserGuardedResponseSchema
    }
}
