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
import http from "http";
import { } from "stream";

const template = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context}  
Answer:`;

const questionsRoute = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: QuestionType/*, Reply: AnswerType*/ }>("/questions", {
    schema: {
      body: Question,
      // response: {
      //   200: Answer
      // }
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

    // const options = { hostname: "ollama", port: 11434, path: "/api/generate", method: "POST" }
    // const ollamaReq = http.request(options, (ollamaRes) => {
    //   ollamaRes.on("data", (data) => {
    //     console.log(data);
    //     console.log("--------------------");
    //   })
    //   ollamaRes.on("end", () => {
    //     console.log("koniec");
    //   })
    // })
    // ollamaReq.write(JSON.stringify({ model: "llama3", prompt: "Why is the sky blue?" }));
    // ollamaReq.end();

    const messageChunk: BaseMessageChunk = await ollama.invoke(question);
    const message: string = messageChunk.content as string;
    // response.status(200).send({ answer: message })
    const stream = await ollama.stream(question);
    response.header("Content-Type", "application/x-ndjson");
    response.status(200).send(stream);
    return response;
  });
};

export default questionsRoute;