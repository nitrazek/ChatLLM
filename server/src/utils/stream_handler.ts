import { OllamaService } from "../services/ollama_service";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { formatDocumentsAsString } from "langchain/util/document"
import { AIMessage, AIMessageChunk, BaseMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ChatMessage } from "../models/chat_message";
import { ChromaService } from "../services/chroma_service";
import { SenderType } from "../enums/sender_type";
import { Chat } from "../models/chat";

export const getRagChain = (template: string, chatMessages: ChatMessage[]) => RunnableSequence.from([
    {
        context: async (input, callbacks) => {
            const chroma = await ChromaService.getInstance();
            const retriever = chroma.asRetriever();
            const retrieverAndFormatter = retriever.pipe(formatDocumentsAsString);
            return retrieverAndFormatter.invoke(input.question, callbacks);
        },
        question: (input) => input.question,
    },
    ChatPromptTemplate.fromMessages([
        ["system", template],
        ...chatMessages.map(message => {
            switch(message.sender) {
                case SenderType.AI: return new AIMessage(message.content);
                case SenderType.HUMAN: return new HumanMessage(message.content);
            }
        }),
        [SenderType.HUMAN.toString(), "{question}"]
    ]),
    OllamaService.getInstance()
]);

export const transformStream = (stream: ReadableStream<BaseMessageChunk>, chat: Chat) => {
    const transformedStream = stream.pipeThrough(getTransformStream(chat));
    if(chat.name !== null) return transformedStream;
    return transformedStream.pipeThrough(getNewChatNameStream(chat));
}

export const getTransformStream = (chat: Chat): TransformStream<BaseMessageChunk, string> => {
    let fullAnswer: string = "";
    return new TransformStream<BaseMessageChunk, string>({
        transform: (chunk, controller) => {
            console.log(chunk.content as string)
            const answer = { answer: chunk.content as string };
            fullAnswer += answer.answer;
            controller.enqueue(JSON.stringify(answer));
        },
        flush: async (controller) => {
            await chat.addMessage(SenderType.AI, fullAnswer);
            controller.terminate();
        }
    });
}
  
export const getNewChatNameStream = (chat: Chat): TransformStream<string, string> => {
    const ollama = OllamaService.getInstance();
    let fullAnswer = "";
    const streamBuffer: { answer: string }[] = [];
    return new TransformStream<string, string>({
        transform: (chunk, controller) => {
            const answer = JSON.parse(chunk);
            streamBuffer.push(answer);
            if (streamBuffer.length <= 1) return;
            fullAnswer += streamBuffer[0].answer;
            controller.enqueue(JSON.stringify(answer));
            streamBuffer.shift();
        },
        flush: async (controller) => {
            fullAnswer += streamBuffer[0].answer;
            const summary: string = (await ollama.invoke(`Summarize this answer into 3 words: ${fullAnswer}`)).content as string;
            chat.name = summary;
            await chat.save();
            controller.enqueue(JSON.stringify({ answer: streamBuffer[0].answer, newChatName: summary }));
            controller.terminate();
        }
    });
}