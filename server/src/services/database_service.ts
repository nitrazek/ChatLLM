import { DataSource } from "typeorm";
import { Chat } from "../models/chat";
import { User } from "../models/user";
import { ChatMessage } from "../models/chat_message";
import { UserRole } from "../enums/user_role";
import { File } from "../models/file";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
    username: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "postgres_pwd",
    database: process.env.POSTGRES_DB ?? "chatdb",
    synchronize: true,
    logging: false,
    entities: [User, Chat, ChatMessage, File],
    migrations: [],
    subscribers: [],
});

export const populateDatabase = async () => {
    const existingAdmin = await User.findOneBy({ name: "superadmin" });
    if(existingAdmin !== null) return;
     
    const admin = User.create({
        name: "superadmin",
        email: "superadmin@admin.com",
        password: "Superadmin1!",
        activated: true,
        role: UserRole.ADMIN
    });
    await admin.save();
}