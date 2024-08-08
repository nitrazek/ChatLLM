import { Callbacks } from "langchain/callbacks";
import { BaseTransformOutputParser, FormatInstructionsOptions } from "langchain/schema/output_parser";
import { TAnswer } from "../schemas/chats_schemas";
import { ollamaLLM } from "../services/ollama_service";
import { editChatName } from "../repositories/chat_repository";
import { BaseMessageChunk } from "langchain/schema";

export const getTransformStream = (): TransformStream<BaseMessageChunk, string> => new TransformStream<BaseMessageChunk, string>({
  transform: (chunk, controller) => {
    const answer: TAnswer = { answer: chunk.content as string };
    controller.enqueue(JSON.stringify(answer));
  },
  flush: (controller) => {
    controller.terminate();
  }
});

export const getTransformStreamNewChatName = (chatId: number): TransformStream<BaseMessageChunk, string> => {
  let fullAnswer: string = "";
  const streamBuffer: TAnswer[] = [];
  return new TransformStream<BaseMessageChunk, string>({
    transform: (chunk, controller) => {
      const answer: TAnswer = { answer: chunk.content as string };
      streamBuffer.push(answer);
      if(streamBuffer.length <= 1) return;
      fullAnswer += streamBuffer[0].answer;
      controller.enqueue(JSON.stringify(answer));
      streamBuffer.shift();
    },
    flush: async (controller) => {
      fullAnswer += streamBuffer[0].answer;
      const summary: string = (await ollamaLLM.invoke(`Summarize this answer into 3 words: ${fullAnswer}`)).content as string;
      editChatName(chatId, summary);
      controller.enqueue(JSON.stringify({ answer: streamBuffer[0].answer, newChatName: summary }));
      controller.terminate();
    }
  });
}