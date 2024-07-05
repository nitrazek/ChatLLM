import { FastifyInstance } from "fastify";
import ollama from "../services/ollama";
import { Answer, AnswerType, Question, QuestionType } from "../schemas/model";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessageChunk } from "langchain/schema";
import { getChromaConnection } from "../services/chroma";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const template = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context}  
Answer:`;

const questionsRoute = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: QuestionType, Reply: AnswerType }>("/questions", {
    schema: {
      body: Question,
      response: {
        200: Answer
      }
    }
  }, async (request, response) => {
    const chroma: Chroma = await getChromaConnection();
    const retriever = chroma.asRetriever();
    const qaChain = RunnableSequence.from([
      {
        context: (input: { question: string }, callbacks) => {
          const retrieverAndFormatter = retriever?.pipe(formatDocumentsAsString);
          return retrieverAndFormatter?.invoke(input.question, callbacks);
        },
        question: new RunnablePassthrough(),
      },
      PromptTemplate.fromTemplate(template),
      ollama,
      new StringOutputParser(),
    ]);

    const question: string = request.body.question;
    const messageChunk: BaseMessageChunk = await ollama.invoke(question);
    response.status(200).send({ answer: messageChunk.content as string })
  });
};

export default questionsRoute;