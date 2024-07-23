import { FastifyInstance } from "fastify";
import ollama from "../services/ollama";
import { Answer, ChatInfo, ChatInfoType, ChatNotFound, ChatNotFoundType, Chats, ChatsType, CreateChat, CreateChatType, Messages, MessagesType, Question, QuestionParams, QuestionParamsType, QuestionType } from "../schemas/model";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory, RunnableConfig } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChromaConnection } from "../services/chroma";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { convertBaseMessageChunkStream } from "../handlers/model";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { Chat, createChat, getChats, getChatById, getChatInfo } from "../repositories/chat";
import { BaseMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { run } from "node:test";

const RAG_TEMPLATE = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context}  
Answer:`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", RAG_TEMPLATE],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chatsRoutes = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: ChatInfoType[]
  }>("/chats", {
    schema: {
      response: {
        200: Chats
      }
    }
  }, async (request, response) => {
    const chats: Chat[] = getChats();
    return response.status(200).send(chats.map(getChatInfo));
  });

  fastify.post<{
    Body: CreateChatType
    Reply: ChatInfoType
  }>("/chats", {
    schema: {
      body: CreateChat,
      response: {
        200: ChatInfo
      }
    }
  }, async (request, response) => {
    const { name, useKnowledgeBase } = request.body;
    const chatInfo: ChatInfoType = createChat(name, useKnowledgeBase);
    return response.status(200).send(chatInfo);
  });

  fastify.get<{
    Params: QuestionParamsType
    Reply: MessagesType | ChatNotFoundType
  }>("/chats/:chatId", {
    schema: {
      params: QuestionParams,
      response: {
        200: Messages,
        404: ChatNotFound
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
    Body: QuestionType,
    Params: QuestionParamsType,
    Reply: ReadableStream<string> | ChatNotFoundType
  }>("/chats/:chatId", {
    schema: {
      body: Question,
      params: QuestionParams,
      response: {
        200: Answer,
        404: ChatNotFound
      }
    }
  }, async (request, response) => {
    const chroma: Chroma = await getChromaConnection();
    const retriever = chroma.asRetriever();
    
    const { question } = request.body;
    const { chatId } = request.params;

    const chat: Chat | undefined = getChatById(chatId);
    if(chat === undefined) return response.status(404).send({ errorMessage: "Chat with given id was not found." });

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      ollama,
      new StringOutputParser()
    ]);

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: prompt.pipe(chain),
      getMessageHistory: (sessionId: number) => chat.messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history"
    });

    const config: RunnableConfig = { configurable: { sessionId: chatId } };
    const stream: ReadableStream<string> = await chainWithHistory.stream({ input: question }, config);
    return response.status(200).send(stream);
  });
};

export default chatsRoutes;