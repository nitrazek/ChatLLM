import { ChatMessageHistory } from "langchain/memory"

export type Chat = {
  name: string,
  messageHistory: ChatMessageHistory,
  useKnowledgeBase: boolean
};

let chatMessageHistories = new Map<number, Chat>();
chatMessageHistories.set(1, {
  name: "test",
  messageHistory: new ChatMessageHistory(),
  useKnowledgeBase: false
});

export const getChat = (sessionId: number): Chat | undefined => chatMessageHistories.get(sessionId);
export const createNewChat = (name: string, useKnowledgeBase: boolean): void => {
  const lastSessionId = Math.max(...chatMessageHistories.keys(), 0);
  chatMessageHistories.set(lastSessionId + 1, {
    name: name,
    messageHistory: new ChatMessageHistory(),
    useKnowledgeBase: useKnowledgeBase
  });
}