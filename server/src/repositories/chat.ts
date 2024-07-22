import { ChatMessageHistory } from "langchain/memory"

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
export const createChat = (name: string, useKnowledgeBase: boolean): void => {
  const lastSessionId = Math.max(...chatMessageHistories.keys(), 0);
  chatMessageHistories.set(lastSessionId + 1, {
    id: lastSessionId + 1,
    name: name,
    messageHistory: new ChatMessageHistory(),
    useKnowledgeBase: useKnowledgeBase
  });
}