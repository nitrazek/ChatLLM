import { FastifyInstance } from "fastify";
import ollama from "../services/ollama";
import { Answer, ChatNotFound, ChatNotFoundType, Question, QuestionParams, QuestionParamsType, QuestionType } from "../schemas/model";
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory, RunnableConfig } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChromaConnection } from "../services/chroma";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { convertBaseMessageChunkStream } from "../handlers/model";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { createNewChat, getChat } from "../repositories/chat";

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
    const optionalChat: ChatMessageHistory | undefined = getChat(sessionId);
    if(optionalChat === undefined) throw new Error();
    return optionalChat;
  },
  inputMessagesKey: "input",
  historyMessagesKey: "history"
});

const chatsRoute = async (fastify: FastifyInstance) => {
  fastify.get("/chats", {
    schema: {}
  }, async (request, response) => {
    
  });

  fastify.post("/chats", {
    schema: {}
  }, async (request, response) => {
    createNewChat();
    return response.status(204).send();
  });

  fastify.post<{
    Body: QuestionType,
    Params: QuestionParamsType,
    Reply: ReadableStream<string> | ChatNotFoundType
  }>("/chats/:chatId/questions", {
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

export default chatsRoute;