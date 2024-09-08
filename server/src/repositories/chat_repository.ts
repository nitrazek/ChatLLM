import { AppDataSource } from "../services/database_service";
import { SenderType } from "../enums/sender_type";
import { Chat } from "../models/chat";
import { ChatMessage } from "../models/chat_message";
import { User } from "../models/user";

export const getChatsByUserId = async (userId: number): Promise<Chat[]> => {
  return await AppDataSource.getRepository(Chat).find({
    where: {
      user: { id: userId }
    },
    relations: ["messageHistory"]
  });
};

export const getChatById = async (chatId: number): Promise<Chat | null> => {
  return await AppDataSource.getRepository(Chat).findOne({
    where: { id: chatId },
    relations: ["messageHistory"]
  });
};

export const createChat = async (name: string | null, isUsingOnlyKnowledgeBase: boolean, user: User): Promise<Chat> => {
  const chatRepository = AppDataSource.getRepository(Chat);
  const newChat = chatRepository.create({ name, isUsingOnlyKnowledgeBase, user });
  return await chatRepository.save(newChat);
};

export const addMessageToChat = async (chatId: number, sender: SenderType, content: string): Promise<ChatMessage> => {
  const chatRepository = AppDataSource.getRepository(Chat);
  const chat = await chatRepository.findOne({ where: { id: chatId } });

  if (!chat) throw new Error("Chat not found");

  const chatMessageRepository = AppDataSource.getRepository(ChatMessage);
  const newMessage = chatMessageRepository.create({ sender, content, chat });
  return await chatMessageRepository.save(newMessage);
};

export const editChatName = async (chatId: number, name: string): Promise<Chat> => {
  const chatRepository = AppDataSource.getRepository(Chat);
  const chat = await getChatById(chatId);

  if (!chat) throw new Error("Chat not found");

  chat.name = name;
  return await chatRepository.save(chat);
}