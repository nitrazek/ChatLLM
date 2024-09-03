import { DataSource } from "typeorm";
import { Chat } from "../models/chat";
import { User } from "../models/user";
import { ChatMessage } from "../models/chat_message";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? "POSTGRES_USER",
    synchronize: true,
    logging: false,
    entities: [User, Chat, ChatMessage],
    migrations: [],
    subscribers: [],
});
