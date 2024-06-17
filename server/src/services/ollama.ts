import { ChatOllama } from "@langchain/community/chat_models/ollama";

const ollamaHost: string = process.env.OLLAMA_HOST ?? "localhost";
const ollamaPort: number = process.env.OLLAMA_PORT ? +process.env.OLLAMA_PORT : 11434;
const ollamaModel: string = process.env.OLLAMA_MODEL ?? "llama3";

const ollama: ChatOllama = new ChatOllama({
  baseUrl: `http://${ollamaHost}:${ollamaPort}`,
  model: ollamaModel
});

export default ollama;