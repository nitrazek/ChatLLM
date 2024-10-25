import { MultipartFile } from "@fastify/multipart";
import pdf from "pdf-parse";
import { FileType } from "../enums/file_type";

export const resolveFileMimetype = (fileMimetype: string): [(file: MultipartFile) => Promise<string>, FileType] | undefined => {
    switch(fileMimetype) {
        case "text/plain": return [getTxtFileHandler, FileType.TXT];
        case "application/pdf": return [getPdfFileHandler, FileType.PDF];
        default: return undefined;
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