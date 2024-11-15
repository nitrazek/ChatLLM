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

            if (!(await this.checkModelsExists(newInstance)))
                throw new Error(`Ollama do not have '${ollamaModel}' or '${ollamaEmbeddingModel}' model. Please pull them manually and restart server.`);

            this.instance = newInstance;
        }

        return this.instance;
    }

    private static async checkModelsExists(instance: ChatOllama): Promise<boolean> {
        const { models } = await instance.client.list();
        
        const hasOllamaModel = models.find(
            (m: any) => m.name === ollamaModel || m.name === `${ollamaModel}:latest`
        );

        const hasEmbeddingModel = models.find(
            (m: any) => m.name === ollamaEmbeddingModel || m.name === `${ollamaEmbeddingModel}:latest`
        );

        return hasOllamaModel && hasEmbeddingModel;
    }
}