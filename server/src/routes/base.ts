import { MultipartFile } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { chroma } from "../services/chroma";

const filesRoute = async (fastify: FastifyInstance) => {
  fastify.post("/files", async (request, response) => {
    const file: MultipartFile | undefined = await request.file();
    if(file === undefined) return response.status(400);
    
    const fileBuffer: Buffer = await file.toBuffer();
    console.log(fileBuffer.toString());

    const documents = await chroma?.addDocuments([{ pageContent: fileBuffer.toString(), metadata: { fileName: file.filename } }], {
      ids: [file.filename]
    });

    return response.status(204);
  });
}

export default filesRoute;