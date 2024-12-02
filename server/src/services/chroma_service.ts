import { ollamaEmbeddingModel, ollamaUrl } from "./ollama_service";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "langchain/document";
import { File } from "../models/file";
import { FileType } from "../enums/file_type";
import { formatDocumentsAsString } from "langchain/util/document";

const chromaUrl: string = process.env.CHROMA_URL ?? "http://localhost:8000";
const chromaConnectionName: string = process.env.CHROMA_CONNECTION_NAME ?? "knowledge-base";

export class ChromaService {
    private static instance: ChromaService;
    private chroma!: Chroma

    private constructor() { }
    
    static async getInstance(): Promise<ChromaService> {
        if (!this.instance) {
            this.instance = new ChromaService();
            this.instance.chroma = await Chroma.fromExistingCollection(new OllamaEmbeddings({
                baseUrl: ollamaUrl,
                model: ollamaEmbeddingModel
            }), {
                collectionName: chromaConnectionName,
                url: chromaUrl
            });
        }
        return this.instance;
    }

    async getContext(question: string, callbacks: any): Promise<string> {
        const retriever = this.chroma.asRetriever({ k: 3 });
        const retrieverAndFormatter = retriever.pipe(formatDocumentsAsString);
        return await retrieverAndFormatter.invoke(question, callbacks);
    }

    async getFileContent(file: File): Promise<string> {
        const fileContent = await this.chroma.collection.get({
            ids: Array.from({ length: file.chunkAmount }, (_, i) => i).map(index => `${file.id}_${index}`)
        });
        const fileContentIds: string[] = fileContent.ids;
        const fileContentDocuments: string[] = fileContent.documents;
        const fileContentString = fileContentDocuments
            .map((document, index) => ({ key: fileContentIds[index], value: document }))
            .sort((a, b) => {
                const numA = parseInt(a.key.split("_")[1]);
                const numB = parseInt(b.key.split("_")[1]);
                return numA - numB;
            })
            .map((documentObj, index) => index === 0 ? documentObj.value : documentObj.value.substring(200))
            .join();

        return fileContentString.length > 1000 ? fileContentString.substring(0, 1000) + "..." : fileContentString;
    }

    async addDocuments(fileId: number, documents: Document[]): Promise<void> {
        await Promise.all(documents.map((document, index) => {
            return this.chroma.addDocuments([document], {
                ids: [`${fileId}_${index}`]
            });
        }));
    }

    async deleteFile(file: File): Promise<void> {
        const fileQueue: File[] = [];
        const deleteFilePromises: Promise<void>[] = [];

        fileQueue.push(file);
        while(fileQueue.length > 0) {
            const currentFile = fileQueue.shift();
            if(currentFile === undefined) break;

            if(currentFile.type === FileType.FOLDER) {
                fileQueue.push(...(await File.findBy({ parent: { id: currentFile.id } })));
                continue;
            }

            deleteFilePromises.push(this.chroma.delete({
                ids: Array.from({ length: currentFile.chunkAmount }, (_, i) => i).map(index => `${currentFile.id}_${index}`)
            }));
        }
        
        
        await Promise.all(deleteFilePromises);
    }
}