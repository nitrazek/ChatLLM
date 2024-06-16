import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export let chroma: Chroma | null = null;

const chromaUrl: string = process.env.CHROMA_URL ?? "http://localhost:9001";

export const createChromaConnection = async () => {
  try {
    chroma = await Chroma.fromExistingCollection(new OllamaEmbeddings(), {
      collectionName: "knowledge-base",
      url: `${chromaUrl}`
    });
  } catch(e) {
    console.log(e);
  }
}