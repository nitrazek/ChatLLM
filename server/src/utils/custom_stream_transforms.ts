import { Callbacks } from "langchain/callbacks";
import { BaseTransformOutputParser, FormatInstructionsOptions } from "langchain/schema/output_parser";
import { ollamaLLM } from "../services/ollama_service";
import { BaseMessageChunk } from "langchain/schema";
import { SenderType } from "../enums/sender_type";

// export const getTransformStream = (chatId: number): TransformStream<BaseMessageChunk, string> => {
//   let fullAnswer: string = "";
//   return new TransformStream<BaseMessageChunk, string>({
//     transform: (chunk, controller) => {
//       const answer: TPostMessageResponse = { answer: chunk.content as string };
//       fullAnswer += answer.answer;
//       controller.enqueue(JSON.stringify(answer));
//     },
//     flush: async (controller) => {
//       await addMessageToChat(chatId, SenderType.AI, fullAnswer);
//       controller.terminate();
//     }
//   });
// }

// export const getNewChatNameStream = (chatId: number): TransformStream<string, string> => {
//   let fullAnswer: string = "";
//   const streamBuffer: TPostMessageResponse[] = [];
//   return new TransformStream<string, string>({
//     transform: (chunk, controller) => {
//       const answer: TPostMessageResponse = JSON.parse(chunk);
//       streamBuffer.push(answer);
//       if (streamBuffer.length <= 1) return;
//       fullAnswer += streamBuffer[0].answer;
//       controller.enqueue(JSON.stringify(answer));
//       streamBuffer.shift();
//     },
//     flush: async (controller) => {
//       fullAnswer += streamBuffer[0].answer;
//       const summary: string = (await ollamaLLM.invoke(`Summarize this answer into 3 words: ${fullAnswer}`)).content as string;
//       await editChatName(chatId, summary);
//       controller.enqueue(JSON.stringify({ answer: streamBuffer[0].answer, newChatName: summary }));
//       controller.terminate();
//     }
//   });
// }