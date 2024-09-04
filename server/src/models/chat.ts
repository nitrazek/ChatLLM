import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";
import { ChatMessage } from "./chat_message";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text', nullable: true })
    name!: string | null;

    @Column({ default: false })
    isUsingOnlyKnowledgeBase!: boolean;

    @ManyToOne(() => User, (user) => user.chats)
    user!: User;

    @OneToMany(() => ChatMessage, (message) => message.chat)
    messageHistory!: ChatMessage[];
}
