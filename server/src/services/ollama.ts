import { ChatOllama } from "@langchain/community/chat_models/ollama";

export const ollamaUrl: string = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const ollamaModel: string = process.env.OLLAMA_MODEL ?? "llama3";

export const ollamaLLM: ChatOllama = new ChatOllama({
  baseUrl: ollamaUrl,
  model: ollamaModel
});