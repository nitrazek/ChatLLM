import { MultipartFile } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { FileUploadError, FileUploadErrorType, FileUploadSuccess, FileUploadSuccessType } from "../schemas/base_schemas";
import { getChromaConnection } from "../services/chroma_service";
import { Chroma } from "@langchain/community/vectorstores/chroma";

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
    
    const fileBuffer: Buffer = await file.toBuffer();
    console.log(fileBuffer.toString());

    const chroma: Chroma = await getChromaConnection();
    await chroma.addDocuments([{ pageContent: fileBuffer.toString(), metadata: { fileName: file.filename } }], {
      ids: [file.filename]
    });

    response.status(204).send();
  });
}

export default filesRoute;