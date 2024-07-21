import { FastifyInstance } from "fastify";
import ollama from "../services/ollama";
import { Answer, ChatInfoType, ChatNotFound, ChatNotFoundType, ChatsType, CreateChatType, Question, QuestionParams, QuestionParamsType, QuestionType } from "../schemas/model";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory, RunnableConfig } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChromaConnection } from "../services/chroma";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { convertBaseMessageChunkStream } from "../handlers/model";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { Chat, createChat, getChats, getChatById } from "../repositories/chat";
import { BaseMessage } from "langchain/schema";

const RAG_TEMPLATE = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context}  
Answer:`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const runnable = prompt.pipe(ollama);
const withHistory = new RunnableWithMessageHistory({
  runnable,
  getMessageHistory: (sessionId: number) => {
    const optChat: Chat | undefined = getChatById(sessionId.toString());
    if(optChat === undefined) throw new Error();
    return optChat.messageHistory;
  },
  inputMessagesKey: "input",
  historyMessagesKey: "history"
});

const chatsRoutes = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: ChatsType
  }>("/chats", {
    schema: {}
  }, async (request, response) => {
    const chats: Chat[] = getChats();
    return response.status(200).send(
      chats.map(({ id, name, useKnowledgeBase }) => ({ id, name, useKnowledgeBase }))
    );
  });

  fastify.post<{
    Body: CreateChatType
  }>("/chats", {
    schema: {}
  }, async (request, response) => {
    const { name, useKnowledgeBase } = request.body;
    createChat(name, useKnowledgeBase);
    return response.status(204).send();
  });

  fastify.get<{
    Params: QuestionParamsType
    Reply: BaseMessage[] | ChatNotFoundType
  }>("/chats/:chatId", {
    schema: {}
  }, async (request, response) => {
    const { chatId } = request.params;
    console.log(chatId);
    console.log(typeof chatId);
    const optChat: Chat | undefined = getChatById(chatId.toString());
    console.log(optChat);
    if(optChat === undefined) return response.status(404).send({ errorMessage: "Chat with given id was not found." });
    return response.status(200).send(await optChat.messageHistory.getMessages());
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
    // const chroma: Chroma = await getChromaConnection();
    // const retriever = chroma.asRetriever();
    // const qaChain = RunnableSequence.from([
    //   {
    //     context: (input: { question: string }, callbacks) => {
    //       const retrieverAndFormatter = retriever.pipe(formatDocumentsAsString);
    //       return retrieverAndFormatter.invoke(input.question, callbacks);
    //     },
    //     question: new RunnablePassthrough(),
    //   },
    //   PromptTemplate.fromTemplate(RAG_TEMPLATE),
    //   ollama,
    //   new StringOutputParser(),
    // ]);
    const { question } = request.body;
    const { chatId } = request.params;
    const config: RunnableConfig = { configurable: { sessionId: chatId } };
    try {
      const stream: ReadableStream<string> = convertBaseMessageChunkStream(await withHistory.stream({ input: question }, config));
      return response.status(200).send(stream);
    } catch(error) {
      return response.status(404).send({ errorMessage: "Chat with given id was not found." });
    }
  });
};

export default chatsRoutes;