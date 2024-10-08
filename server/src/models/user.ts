import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, BeforeInsert, BeforeUpdate, AfterInsert, AfterLoad } from "typeorm";
import { Chat } from "./chat";
import { UserRole } from "../enums/user_role";
import { ExtendedBaseEntity } from "./extended_base_entity";
import { IsEmail, IsEnum, IsOptional, IsStrongPassword, Length, MaxLength } from "class-validator";
import { getIsInvalidMessage } from "../utils/model_validation_messages";
import { compare, hash, genSalt } from "bcrypt";

@Entity()
@Unique(['email', 'name'])
export class User extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(4, 30, { message: getIsInvalidMessage('Name')})
    name!: string;

    @Column()
    @IsEmail(undefined, { message: getIsInvalidMessage('Email') })
    email!: string;

    @Column()
    @IsStrongPassword({ minLength: 6 }, { message: getIsInvalidMessage('Password') })
    @MaxLength(30, { message: getIsInvalidMessage('Password') })
    password!: string;

    @Column({ default: false })
    activated!: boolean;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    @IsEnum(UserRole, { message: getIsInvalidMessage('Role') })
    @IsOptional()
    role!: UserRole;

    @OneToMany(() => Chat, (chat) => chat.user)
    chats!: Chat[];

    // This property stores an original password for comparing in hashing process
    private cachedPassword!: string;

    @AfterLoad()
    cachePassword() {
        this.cachedPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.cachedPassword === this.password) return;
        const salt = await genSalt();
        this.password = await hash(this.password, salt);
    }

    async isPasswordValid(password: string): Promise<boolean> {
        return await compare(password, this.password);
    }

    activate() { 
        this.activated = true;
    }
}
