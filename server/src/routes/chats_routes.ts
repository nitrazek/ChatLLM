import { FastifyInstance } from "fastify";
import { ollamaLLM } from "../services/ollama_service";
import {
  Answer,
  ChatInfo,
  ErrorChatNotFound,
  GetChatsResponse,
  GetMessagesParams,
  GetMessagesResponse,
  Message,
  PostChat,
  PostMessage,
  PostMessageParams,
  TChatInfo,
  TErrorChatNotFound,
  TGetChatsResponse,
  TGetMessagesParams, 
  TGetMessagesResponse, 
  TMessage,
  TPostChat,
  TPostMessage,
  TPostMessageParams
} from "../schemas/chats_schemas";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory, RunnableConfig } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChromaConnection } from "../services/chroma_service";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { Chat, createChat, getChats, getChatById, getChatInfo } from "../repositories/chat_repository";
import { AIMessage, AIMessageChunk, BaseMessage, BaseMessageChunk, HumanMessage, SystemMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { run } from "node:test";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { ONLY_RAG_TEMPLATE, RAG_TEMPLATE } from "../prompts";
import CustomTransformOutputParser from "../utils/CustomTransformOutputParser";
import { Type } from "@sinclair/typebox";
import { push } from "langchain/hub";

const chatsRoutes = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: TGetChatsResponse
  }>("", {
    schema: {
      response: {
        200: GetChatsResponse
      }
    }
  }, async (request, response) => {
    const chats: Chat[] = getChats();
    return response.status(200).send(chats.map(getChatInfo));
  });

  fastify.post<{
    Body: TPostChat
    Reply: TChatInfo
  }>("", {
    schema: {
      body: PostChat,
      response: {
        200: ChatInfo
      }
    }
  }, async (request, response) => {
    const { name, isUsingOnlyKnowledgeBase } = request.body;
    const chatInfo: TChatInfo = createChat(name, isUsingOnlyKnowledgeBase);
    return response.status(200).send(chatInfo);
  });

  fastify.get<{
    Params: TGetMessagesParams
    Reply: TGetMessagesResponse | TErrorChatNotFound
  }>("/:chatId", {
    schema: {
      params: GetMessagesParams,
      response: {
        200: GetMessagesResponse,
        404: ErrorChatNotFound
      }
    }
  }, async (request, response) => {
    const { chatId } = request.params;
    console.log(chatId);
    console.log(typeof chatId);
    const optChat: Chat | undefined = getChatById(chatId);
    console.log(optChat);
    if(optChat === undefined) return response.status(404).send({ errorMessage: "Chat with given id was not found." });
    const messages: BaseMessage[] = await optChat.messageHistory.getMessages();
    return response.status(200).send(messages.map(baseMessage => {
      const sender = baseMessage.lc_id.includes("HumanMessage") ? "human" : "ai";
      const content = baseMessage.lc_kwargs.content;
      return { sender, content };
    }));
  });

  fastify.post<{
    Body: TPostMessage,
    Params: TPostMessageParams,
    Reply: ReadableStream<string> | TErrorChatNotFound
  }>("/:chatId", {
    schema: {
      body: PostMessage,
      params: PostMessageParams,
      response: {
        200: Answer,
        404: ErrorChatNotFound
      }
    }
  }, async (request, response) => {
    const { question } = request.body;
    const { chatId } = request.params;

    const chat: Chat | undefined = getChatById(chatId);
    if(chat === undefined) return response.status(404).send({ errorMessage: "Chat with given id was not found." });

    const template: string = chat.isUsingOnlyKnowledgeBase ? ONLY_RAG_TEMPLATE : RAG_TEMPLATE;
    const chain = RunnableSequence.from([
      {
        context: async (input, callbacks) => {
          const chroma: Chroma = await getChromaConnection();
          const retriever = chroma.asRetriever();
          const retrieverAndFormatter = retriever.pipe(formatDocumentsAsString);
          return await retrieverAndFormatter.invoke(input.question, callbacks);
        },
        question: (input) => input.question,
        history: (input) => input.history
      },
      ChatPromptTemplate.fromMessages([
        ["system", template],
        new MessagesPlaceholder("history"),
        ["human", "{question}"]
      ]),
      ollamaLLM,
      //new CustomTransformOutputParser()
    ]);

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId: number) => chat.messageHistory,
      inputMessagesKey: "question",
      historyMessagesKey: "history"
    });

    const config: RunnableConfig = { configurable: { sessionId: chatId } };
    const stream: ReadableStream<BaseMessageChunk> = await chainWithHistory.stream({ question }, config);

    const streamBuffer: BaseMessageChunk[] = [];
    const reader = stream.getReader();
    const newStream: ReadableStream<string> = new ReadableStream({
      start: (controller) => {
        const push = () => reader.read().then(({ done, value }) => {
          if(done) {
            controller.enqueue(JSON.stringify({ answer: streamBuffer[0].content, newChatName: "Nowy czat" }));
            console.log("wysłano");
            controller.close();
            return;
          }
          streamBuffer.push(value!);
          if(streamBuffer.length <= 1) {
            push();
            return;
          }
          controller.enqueue(JSON.stringify({ answer: streamBuffer[0].content }));
          console.log("wysłano");
          streamBuffer.shift();
          push();
        });
        push();
      }
    });
    return response.status(200).send(newStream);
  }); 
};

export default chatsRoutes;