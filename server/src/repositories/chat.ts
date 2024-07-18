import { ChatMessageHistory } from "langchain/memory"

let chatMessageHistories = new Map<number, ChatMessageHistory>();
chatMessageHistories.set(1, new ChatMessageHistory());

export const getChat = (sessionId: number): ChatMessageHistory | undefined => chatMessageHistories.get(sessionId);
export const createNewChat = (): void => {
  const lastSessionId = Math.max(...chatMessageHistories.keys(), 0);
  chatMessageHistories.set(lastSessionId + 1, new ChatMessageHistory());
}