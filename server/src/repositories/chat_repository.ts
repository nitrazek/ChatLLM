import { ChatMessageHistory } from "langchain/memory"
import { TChatInfo } from "../schemas/chats_schemas";

export type Chat = {
  id: number,
  name: string | null,
  messageHistory: ChatMessageHistory,
  isUsingOnlyKnowledgeBase: boolean
};

let chatMessageHistories = new Map<number, Chat>();
chatMessageHistories.set(1, {
  id: 1,
  name: "test",
  messageHistory: new ChatMessageHistory(),
  isUsingOnlyKnowledgeBase: false
});

export const getChats = (): Chat[] => [...chatMessageHistories.values()];

export const getChatById = (id: number): Chat | undefined => chatMessageHistories.get(id);

export const getChatInfo = ({ id, name, isUsingOnlyKnowledgeBase }: Chat): TChatInfo => ({ id, name, isUsingOnlyKnowledgeBase });

export const createChat = (name: string | null, isUsingOnlyKnowledgeBase: boolean): Chat => {
  const id = Math.max(...chatMessageHistories.keys(), 0) + 1;
  const newChat: Chat = {
    id: id,
    name: name,
    messageHistory: new ChatMessageHistory(),
    isUsingOnlyKnowledgeBase: isUsingOnlyKnowledgeBase
  };
  chatMessageHistories.set(id, newChat);
  return newChat;
}

export const editChatName = (id: number, name: string): void => {
  const chat: Chat | undefined = getChatById(id);
  if(chat === undefined) return;
  chat.name = name;
  chatMessageHistories.set(id, chat);
}