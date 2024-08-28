import { MultipartFile } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { FileUploadError, FileUploadErrorType, FileUploadSuccess, FileUploadSuccessType } from "../schemas/base_schemas";
import { getChromaConnection } from "../services/chroma_service";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { getFileHandler } from "../utils/file_handlers";

const filesRoute = async (fastify: FastifyInstance) => {
  fastify.post<{ Reply: FileUploadSuccessType | FileUploadErrorType }>("/files", {
    schema: {
      response: {
        204: FileUploadSuccess,
        400: FileUploadError
      }
    }
  }, async (request, response) => {
    const file: MultipartFile | undefined = await request.file();
    if(file === undefined) { 
      response.status(400).send();
      return;
    }
    
    const fileHandler: ((file: MultipartFile) => Promise<string>) | undefined = getFileHandler(file.mimetype);
    if(fileHandler === undefined) {
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