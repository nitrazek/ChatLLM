import { DataSource } from "typeorm";
import { Chat } from "../models/chat";
import { User } from "../models/user";
import { ChatMessage } from "../models/chat_message";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
    username: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "postgres_pwd",
    database: process.env.POSTGRES_DB ?? "chatdb",
    synchronize: true,
    logging: false,
    entities: [User, Chat, ChatMessage],
    migrations: [],
    subscribers: [],
});
