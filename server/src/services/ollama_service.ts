import { ChatOllama, Ollama } from "@langchain/ollama";

export const ollamaUrl: string = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const ollamaModel: string = process.env.OLLAMA_MODEL ?? "llama3.2";
export const ollamaEmbeddingModel: string = process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text";

export class OllamaService {
    private static instance: ChatOllama;
    
    private constructor() {}
  
    static async getInstance(): Promise<ChatOllama> {
        if (!this.instance) {
            const newInstance: ChatOllama = new ChatOllama({
                baseUrl: ollamaUrl,
                model: ollamaModel
            });

            if (!(await this.checkModelExists(newInstance)))
                throw new Error(`Ollama do not have model '${ollamaModel}'. Please pull it manually and restart server.`);

            this.instance = newInstance;
        }

        return this.instance;
    }

    private static async checkModelExists(instance: ChatOllama): Promise<boolean> {
        const { models } = await instance.client.list();
        return !!models.find(
            (m: any) => m.name === ollamaModel || m.name === `${ollamaModel}:latest`
        );
    }
}