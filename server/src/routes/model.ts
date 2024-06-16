import { FastifyInstance } from "fastify";
import ollama from "../services/ollama";
import { Answer, AnswerType, Question, QuestionType } from "../schemas/model";
import { chroma } from "../services/chroma";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const questionsRoute = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: QuestionType, Reply: AnswerType }>("/questions", {
    schema: {
      body: Question,
      response: {
        200: Answer
      }
    }
  }, async (request, response) => {
    const retriever = chroma?.asRetriever();
    const ragPrompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
    const qaChain = RunnableSequence.from([
      {
        context: (input: { question: string }, callbacks) => {
          const retrieverAndFormatter = retriever?.pipe(formatDocumentsAsString);
          return retrieverAndFormatter?.invoke(input.question, callbacks);
        },
        question: new RunnablePassthrough(),
      },
      ragPrompt,
      ollama,
      new StringOutputParser(),
    ]);

    const question: string = request.body.question;
    const answer: string = await qaChain.invoke({ question });
    response.status(200).send({ answer: answer })
  });
};

export default questionsRoute;