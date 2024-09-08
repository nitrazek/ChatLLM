import { MultipartFile } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { FileUploadError, TFileUploadError, FileUploadSuccess, TFileUploadSuccess } from "../schemas/files_schemas";
import { getChromaConnection } from "../services/chroma_service";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { getFileHandler } from "../utils/file_handlers";

const filesRoute = async (fastify: FastifyInstance) => {
  fastify.post<{
    Reply: TFileUploadSuccess | TFileUploadError
  }>("/upload", {
    schema: {
      summary: "Upload a file to the knowledge base",
      description: "Uploads a file to the server and processes it for adding to the knowledge base.",
      tags: ["Files"],
      response: {
        204: FileUploadSuccess,
        400: FileUploadError
      }
    }
  }, async (request, response) => {
    const file: MultipartFile | undefined = await request.file();
    if (file === undefined) {
      response.status(400).send();
      return;
    }

    const fileHandler: ((file: MultipartFile) => Promise<string>) | undefined = getFileHandler(file.mimetype);
    if (fileHandler === undefined) {
      response.status(400).send();
      return;
    }

    const chroma: Chroma = await getChromaConnection();
    await chroma.addDocuments([{ pageContent: await fileHandler(file), metadata: { fileName: file.filename } }], {
      ids: [file.filename]
    });

    response.status(204).send();
  });
}

export default filesRoute;