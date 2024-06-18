import { ChatOllama } from "@langchain/community/chat_models/ollama";

const ollamaUrl: string = process.env.OLLAMA_URL ?? "http://localhost:11434"
const ollamaModel: string = process.env.OLLAMA_MODEL ?? "llama2";

const ollama: ChatOllama = new ChatOllama({
  baseUrl: ollamaUrl,
  model: ollamaModel
});

export default ollama;