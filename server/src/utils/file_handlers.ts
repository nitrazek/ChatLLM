import { MultipartFile } from "@fastify/multipart";
// import * as pdfjsDist from "pdfjs-dist"
import { TextContent, TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

export const getFileHandler = (fileMimetype: string) => {
  switch(fileMimetype) {
    case "text/plain": return getTxtFileHandler;
    case "application/pdf": return getPdfFileHandler;
  }
}

const getTxtFileHandler = async (file: MultipartFile): Promise<string> => {
  const fileBuffer: Buffer = await file.toBuffer();
  return fileBuffer.toString();
}

const getPdfFileHandler = async (file: MultipartFile): Promise<string> => {
  const pdfjsDist = await import("pdfjs-dist");
  const fileArray: Uint8Array = new Uint8Array(await file.toBuffer());
  const pdf = await pdfjsDist.getDocument(fileArray).promise;

  let text = "";
  for(let i=0; i<pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent: TextContent = await page.getTextContent();
    const strings = textContent.items
      .filter(isTextItem)
      .map(item => item.str);
    text += strings.join(' ') + '\n';
  }
  return text;
}

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => {
  return item && typeof item === "object" && "str" in item && typeof item.str === "string";
}