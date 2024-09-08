import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ollamaModel, ollamaUrl } from "./ollama_service";

const chromaUrl: string = process.env.CHROMA_URL ?? "http://localhost:8000";
const chromaConnectionName: string = process.env.CHROMA_CONNECTION_NAME ?? "knowledge-base";

export const getChromaConnection = async (): Promise<Chroma> => {
  return await Chroma.fromExistingCollection(new OllamaEmbeddings({
    baseUrl: ollamaUrl,
    model: ollamaModel
  }), {
    collectionName: chromaConnectionName,
    url: chromaUrl
  });
}