import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Chat } from "./chat";
import { SenderType } from "../enums/sender_type";

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sender!: SenderType;

    @Column()
    content!: string;

    @ManyToOne(() => Chat, (chat) => chat.messageHistory)
    chat!: Chat;
}
