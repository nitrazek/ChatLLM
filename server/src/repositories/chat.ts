import { ChatMessageHistory } from "langchain/memory"
import { ChatInfoType } from "../schemas/model";

export type Chat = {
  id: number,
  name: string,
  messageHistory: ChatMessageHistory,
  useKnowledgeBase: boolean
};

let chatMessageHistories = new Map<number, Chat>();
chatMessageHistories.set(1, {
  id: 1,
  name: "test",
  messageHistory: new ChatMessageHistory(),
  useKnowledgeBase: false
});

export const getChats = (): Chat[] => [...chatMessageHistories.values()];
export const getChatById = (sessionId: number): Chat | undefined => {
  console.log({ sessionId });
  return chatMessageHistories.get(sessionId);
};
export const createChat = (name: string, useKnowledgeBase: boolean): ChatInfoType => {
  const id = Math.max(...chatMessageHistories.keys(), 0) + 1;
  const newChat: Chat = {
    id: id,
    name: name,
    messageHistory: new ChatMessageHistory(),
    useKnowledgeBase: useKnowledgeBase
  };
  chatMessageHistories.set(id, newChat);
  return { id, name, useKnowledgeBase };
}