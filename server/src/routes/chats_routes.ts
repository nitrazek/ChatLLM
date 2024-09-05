import { FastifyInstance } from "fastify";
import { ONLY_RAG_TEMPLATE, RAG_TEMPLATE } from "../prompts";
import {
  TGetChatsParams,
  TGetChatsResponse,
  TGetMessagesParams,
  TGetMessagesResponse,
  TPostChatBody,
  TPostChatResponse,
  TPostMessageBody,
  TPostMessageParams,
  TErrorWithMessage,
  GetChatsResponse,
  GetMessagesResponse,
  ErrorWithMessage,
  PostChatResponse,
  PostMessageResponse,
  PostChatBody,
  PostMessageBody,
  TPostChatParams
} from "../schemas/chats_schemas";
import { getChatsByUserId, getChatById, createChat, addMessageToChat } from "../repositories/chat_repository";
import { Chat } from "../models/chat";
import { SenderType } from "../enums/sender_type";
import { RunnableSequence } from "langchain/runnables";
import { Chroma } from "langchain/vectorstores/chroma";
import { getChromaConnection } from "../services/chroma_service";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate } from "langchain/prompts";
import { ollamaLLM } from "../services/ollama_service";
import { BaseMessageChunk } from "langchain/schema";
import { getTransformStream, getTransformStreamNewChatName } from "../utils/custom_stream_transforms";
import { getUserById } from "../repositories/user_repository";

const chatsRoutes = async (fastify: FastifyInstance) => {

  // Get a list of chats for a specific user
  fastify.get<{
    Params: TGetChatsParams
    Reply: TGetChatsResponse | TErrorWithMessage
  }>("/list/:userId", {
    schema: {
      summary: "Get list of chats",
      description: "Retrieves a list of chats associated with a specific user.",
      tags: ["Chats"],
      response: {
        200: GetChatsResponse,
        404: ErrorWithMessage
      }
    }
  }, async (request, response) => {
    const { userId } = request.params;
    const user = await getUserById(userId)
    if (!user) {
      return response.status(404).send({ errorMessage: "User do not exists" });
    }

    const chats = await getChatsByUserId(userId);
    return response.status(200).send(chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      isUsingOnlyKnowledgeBase: chat.isUsingOnlyKnowledgeBase
    })));
  });

  // Get chat history
  fastify.get<{
    Params: TGetMessagesParams,
    Reply: TGetMessagesResponse | TErrorWithMessage
  }>("/:chatId", {
    schema: {
      summary: "Get chat history",
      description: "Retrieves the message history for a specific chat.",
      tags: ["Chats"],
      response: {
        200: GetMessagesResponse,
        404: ErrorWithMessage
      }
    }
  }, async (request, response) => {
    const { chatId } = request.params;
    const chat = await getChatById(chatId);
    if (!chat) return response.status(404).send({ errorMessage: "Chat with given id was not found." });

    return response.status(200).send(chat.messageHistory.map(message => ({
      sender: message.sender,
      content: message.content
    })));
  });

  // Create a new chat
  fastify.post<{
    Params: TPostChatParams,
    Body: TPostChatBody,
    Reply: TPostChatResponse | TErrorWithMessage
  }>("/new/:userId", {
    schema: {
      summary: "Create new chat",
      description: "Creates a new chat for the user.",
      body: PostChatBody,
      tags: ["Chats"],
      response: {
        200: PostChatResponse,
      }
    }
  }, async (request, response) => {
    const { userId } = request.params;
    const { name, isUsingOnlyKnowledgeBase } = request.body;

    const user = await getUserById(userId);
    if (!user) {
      return response.status(401).send({ errorMessage: "User do not exists" });
    }

    const chat = await createChat(name, isUsingOnlyKnowledgeBase, user);
    return response.status(200).send({
      id: chat.id,
      name: chat.name,
      isUsingOnlyKnowledgeBase: chat.isUsingOnlyKnowledgeBase
    });
  });

  // Send a message to existing chat
  fastify.post<{
    Body: TPostMessageBody,
    Params: TPostMessageParams,
    Reply: ReadableStream<string> | TErrorWithMessage
  }>("/:chatId", {
    schema: {
      summary: "Send message to chat",
      description: "Sends a new message to an existing chat and retrieves a response from the LLM.",
      body: PostMessageBody,
      tags: ["Chats"],
      response: {
        200: PostMessageResponse,
        404: ErrorWithMessage
      }
    }
  }, async (request, response) => {
    const { question } = request.body;
    const { chatId } = request.params;

    const chat: Chat | null = await getChatById(chatId);
    if (chat === null) {
      return response.status(404).send({ errorMessage: "Chat with given id was not found." });
    }

    await addMessageToChat(chatId, SenderType.HUMAN, question);

    const template: string = chat.isUsingOnlyKnowledgeBase ? ONLY_RAG_TEMPLATE : RAG_TEMPLATE;

    const chain = RunnableSequence.from([
      {
        context: async (input, callbacks) => {
          const chroma: Chroma = await getChromaConnection();
          const retriever = chroma.asRetriever();
          const retrieverAndFormatter = retriever.pipe(formatDocumentsAsString);
          return retrieverAndFormatter.invoke(input.question, callbacks);
        },
        question: (input) => input.question,
      },
      ChatPromptTemplate.fromMessages([
        ["system", template],
        [SenderType.HUMAN.toString(), "{question}"]
      ]),
      ollamaLLM
    ]);

    const stream: ReadableStream<BaseMessageChunk> = await chain.stream({ question });
    const transformStream: TransformStream<BaseMessageChunk, string> = chat.name == null ? getTransformStreamNewChatName(chatId) : getTransformStream();

    const responeStream = stream.pipeThrough(transformStream);

    //let answer = "";
    // TODO: Asynchronously collect entire message and after that add it to the database with the function below
    //await addMessageToChat(chatId, SenderType.AI, answer);

    return response.status(200).send(responeStream);

    // TODO: Fix deprication
    //---------------------->          [WARNING]: Importing from "langchain/runnables" is deprecated.          <----------------------
  });
};

export default chatsRoutes;
