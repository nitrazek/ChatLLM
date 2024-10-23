import { ChatOllama } from "@langchain/ollama";

export const ollamaUrl: string = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const ollamaModel: string = process.env.OLLAMA_MODEL ?? "llama3.1";

export class OllamaService {
    private static instance: ChatOllama;
    
    private constructor() {}
  
    static getInstance(): ChatOllama {
        if (!this.instance) {
            this.instance = new ChatOllama({
                baseUrl: ollamaUrl,
                model: ollamaModel,
                checkOrPullModel: true
            });
        }

        return this.instance;
    }
}