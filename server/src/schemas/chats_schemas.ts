import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for GET requests ////////////////////

// Schema for getting a list of chats for a specific user
export const GetChatsParams = Type.Object({
  userId: Type.Number({ description: "ID of the user for whom to get the list of chats." })
});
export type TGetChatsParams = Static<typeof GetChatsParams>;


export const GetChatsResponse = Type.Array(
  Type.Object({
    id: Type.Number({ description: "Id of the chat." }),
    name: Type.Union([Type.Null(), Type.String()], { description: "Name of the chat. If null, chat will be named automatically on first answer.", default: "test" }),
    isUsingOnlyKnowledgeBase: Type.Boolean({ description: "If true, the chat model will only use context from the knowledge base; otherwise, it will use its own knowledge as well." }),
  }, {
    description: "Object containing information about a single chat."
  }),
  {
    description: "List of information objects of available chats."
  }
);
export type TGetChatsResponse = Static<typeof GetChatsResponse>;

// Schema for getting chat messages
export const GetMessagesParams = Type.Object({
  chatId: Type.Number({ description: "The ID of the chat." }),
});
export type TGetMessagesParams = Static<typeof GetMessagesParams>;

export const GetMessagesResponse = Type.Array(
  Type.Object({
    sender: Type.String({ description: "Who sent the message: human or ai." }),
    content: Type.String({ description: "Content of the message." }),
  }, {
    description: "Object containing details of a single message."
  }),
  {
    description: "List of all messages in the chat."
  }
);
export type TGetMessagesResponse = Static<typeof GetMessagesResponse>;



//////////////////// Schema for POST requests ////////////////////

// Schema for creating a new chat
export const PostChatParams = Type.Object({
  userId: Type.Number({ description: "ID of the user for whom to create new chat." })
});
export type TPostChatParams = Static<typeof PostChatParams>;

export const PostChatBody = Type.Object({
  name: Type.Union([Type.Null(), Type.String()], { description: "Name of the new chat. If null, chat will be named automatically on the first answer.", default: "test" }),
  isUsingOnlyKnowledgeBase: Type.Boolean({ description: "If true, the chat model will only use context from the knowledge base; otherwise, it will use its own knowledge as well." }),
}, {
  description: "Object containing information for creating a new chat."
});
export type TPostChatBody = Static<typeof PostChatBody>;


export const PostChatResponse = Type.Object({
  id: Type.Number({ description: "Id of the chat." }),
  name: Type.Union([Type.Null(), Type.String()], { description: "Name of the chat. If null, chat will be named automatically on the first answer.", default: "test" }),
  isUsingOnlyKnowledgeBase: Type.Boolean({ description: "If true, the chat model will only use context from the knowledge base; otherwise, it will use its own knowledge as well." }),
}, {
  description: "Object containing information about a single chat."
});
export type TPostChatResponse = Static<typeof PostChatResponse>;

// Schema for sending a message to existing chat
export const PostMessageBody = Type.Object({
  question: Type.String({ description: "Content of the question." })
}, {
  description: "Information about the question sent by the user (newChatName field is optional)."
});
export type TPostMessageBody = Static<typeof PostMessageBody>;

export const PostMessageParams = Type.Object({
  chatId: Type.Number({ description: "The ID of the chat." }),
});
export type TPostMessageParams = Static<typeof PostMessageParams>;

export const PostMessageResponse = Type.Object({
  answer: Type.String({ description: "Content of the answer." })
}, {
  description: "Stream of stringified answer chunks in the format specified."
});
export type TPostMessageResponse = Static<typeof PostMessageResponse>;


//////////////////// Schema for errors ////////////////////

// Schema for chat not found error
export const ErrorWithMessage = Type.Object({
  errorMessage: Type.String({
    description: "Reason of error that occured."
  })
}, {
  description: "Error indicating that something was not right."
});
export type TErrorWithMessage = Static<typeof ErrorWithMessage>;