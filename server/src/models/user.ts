import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Chat } from "./chat";
import { UserRole } from "../enums/user_role";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({ default: false })
    activated!: boolean;

    @Column({ default: UserRole.USER })
    role!: UserRole;

    @OneToMany(() => Chat, (chat) => chat.user)
    chats!: Chat[];
}
