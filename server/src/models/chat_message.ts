import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Chat } from "./chat";
import { SenderType } from "../enums/sender_type";
import { IsEnum, IsNotEmpty } from "class-validator";
import { getIsInvalidMessage } from "../utils/model_validation_messages";
import { ExtendedBaseEntity } from "./extended_base_entity";

@Entity()
export class ChatMessage extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: SenderType })
    @IsEnum(SenderType, { message: getIsInvalidMessage('Sender') })
    sender!: SenderType;

    @Column()
    @IsNotEmpty({ message: getIsInvalidMessage("Content") })
    content!: string;

    @ManyToOne(() => Chat, (chat) => chat.messageHistory)
    chat!: Chat;
}
