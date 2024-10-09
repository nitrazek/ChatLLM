
import { ollamaModel, ollamaUrl } from "./ollama_service";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const chromaUrl: string = process.env.CHROMA_URL ?? "http://localhost:8000";
const chromaConnectionName: string = process.env.CHROMA_CONNECTION_NAME ?? "knowledge-base";

export class ChromaService {
    private static instance: Chroma;

    private constructor() { }
    
    public static async getInstance(): Promise<Chroma> {
        if (!this.instance) {
            this.instance = await Chroma.fromExistingCollection(new OllamaEmbeddings({
                baseUrl: ollamaUrl,
                model: ollamaModel
            }), {
                collectionName: chromaConnectionName,
                url: chromaUrl
            });
        }
        return this.instance;
    }
}