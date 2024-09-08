import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for POST requests ////////////////////

// Schema for uploading file to files database
export const FileUploadSuccess = Type.Null({
  description: "File added successfully to knowledge base."
});
export type TFileUploadSuccess = Static<typeof FileUploadSuccess>;

export const FileUploadError = Type.Object({
  message: Type.String()
}, {
  description: "No file was found in request."
});
export type TFileUploadError = Static<typeof FileUploadError>;