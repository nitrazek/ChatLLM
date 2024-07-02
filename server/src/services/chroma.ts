import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const chromaUrl: string = process.env.CHROMA_URL ?? "http://localhost:9001";
const chromaConnectionName: string = process.env.CHROMA_CONNECTION_NAME ?? "knowledge-base";

export const getChromaConnection = async (): Promise<Chroma> => {
  return await Chroma.fromExistingCollection(new OllamaEmbeddings(), {
    collectionName: chromaConnectionName,
    url: chromaUrl
  });
}