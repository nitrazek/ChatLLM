import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";
import { ChatMessage } from "./chat_message";
import { IsOptional, Length } from "class-validator";
import { ExtendedBaseEntity } from "./extended_base_entity";
import { getIsInvalidMessage } from "../utils/model_validation_messages";
import { SenderType } from "../enums/sender_type";

@Entity()
export class Chat extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text', nullable: true })
    @Length(1, 30, { message: getIsInvalidMessage('Name') })
    @IsOptional()
    name!: string;

    @Column({ default: false })
    isUsingOnlyKnowledgeBase!: boolean;

    @ManyToOne(() => User, (user) => user.chats, {
        onDelete: "CASCADE"
    })
    user!: User;

    @OneToMany(() => ChatMessage, (message) => message.chat, {
        cascade: true,
        onDelete: "CASCADE"
    })
    messageHistory!: ChatMessage[];

    async addMessage(sender: SenderType, content: string) {
        const chatMessage = ChatMessage.create({
            sender,
            content,
            chat: this
        });
        await chatMessage.save();
        await this.reload();
    }
}
