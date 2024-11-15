import { Static, Type } from "@sinclair/typebox";

// Schema for Authorization header
export const AuthHeaderTypes = Type.Object({
  Authorization: Type.String({ description: "JWT token in the format 'Bearer <token>'" })
}, { description: "Authorization header with JWT token" });
export type AuthHeader = Static<typeof AuthHeaderTypes>;

// Schema for pagination metadata
export const PaginationMetadataTypes = Type.Object({
  totalPages: Type.Number({ description: "Amount of total pages" }),
  currentPage: Type.Number({ description: "Number of current page" }),
  prevPage: Type.Union([Type.Number(), Type.Null()], {
      description: "Number of previous page, null if there is no previous page"
  }),
  nextPage: Type.Union([Type.Number(), Type.Null()], {
      description: "Number of next page, null if there is no next page"
  })
}, { description: "Information about pagination" });
export type PaginationMetadata = Static<typeof PaginationMetadataTypes>;