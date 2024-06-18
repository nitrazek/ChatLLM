import { MultipartFile } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { chroma } from "../services/chroma";
import { FileUploadError, FileUploadErrorType, FileUploadSuccess, FileUploadSuccessType } from "../schemas/base";

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

    const documents = await chroma?.addDocuments([{ pageContent: fileBuffer.toString(), metadata: { fileName: file.filename } }], {
      ids: [file.filename]
    });

    response.status(204).send();
  });
}

export default filesRoute;