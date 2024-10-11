import { MultipartFile } from "@fastify/multipart";
import pdf from "pdf-parse";

export const getFileHandler = (fileMimetype: string) => {
    switch(fileMimetype) {
        case "text/plain": return getTxtFileHandler;
        case "application/pdf": return getPdfFileHandler;
    }
}

// Handler for text files (.txt)
const getTxtFileHandler = async (file: MultipartFile): Promise<string> => {
    const fileBuffer: Buffer = await file.toBuffer();
    return fileBuffer.toString();
}

// Handler for PDF files
const getPdfFileHandler = async (file: MultipartFile): Promise<string> => {
    const fileBuffer = await file.toBuffer();
    const pdfData = await pdf(fileBuffer);
    return pdfData.text;
}