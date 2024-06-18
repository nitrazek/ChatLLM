import { Static, Type } from "@sinclair/typebox";

export const FileUploadSuccess = Type.Null({
  description: "File added successfully to knowledge base"
});
export type FileUploadSuccessType = Static<typeof FileUploadSuccess>;

export const FileUploadError = Type.Object({
  message: Type.String({
    default: "No file was found in request"
  })
}, {
  description: "No file was found in request"
});
export type FileUploadErrorType = Static<typeof FileUploadError>;