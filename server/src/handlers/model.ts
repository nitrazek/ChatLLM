import { BaseMessageChunk } from "langchain/schema";

export const convertBaseMessageChunkStream = (ollamaStream: ReadableStream<BaseMessageChunk>): ReadableStream<string> => {
  const reader: ReadableStreamDefaultReader<BaseMessageChunk> = ollamaStream.getReader();
  return new ReadableStream<string>({
    start(controller) {
      function push() {
        reader.read().then(({ done, value }) => {
          if(done) {
            controller.close();
            return;
          }
          controller.enqueue(JSON.stringify({ answer: value.content as string }));
          push();
        });
      }
      push();
    }
  });
}