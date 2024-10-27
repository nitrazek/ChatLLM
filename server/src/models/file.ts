import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ExtendedBaseEntity } from "./extended_base_entity";
import { FileType } from "../enums/file_type";
import { User } from "./user";
import { IsEnum, Length } from "class-validator";
import { getIsInvalidMessage } from "../utils/model_validation_messages";

@Entity()
@Unique(['name'])
export class File extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(1, 50, { message: getIsInvalidMessage('Name') })
    name!: string;

    @Column({ type: 'enum', enum: FileType })
    @IsEnum(FileType, { message: getIsInvalidMessage('Type') })
    type!: FileType;

    @ManyToOne(() => File, (file) => file.children, { nullable: true })
    parent!: File | null;

    @OneToMany(() => File, (file) => file.parent)
    children!: File[];

    @ManyToOne(() => User, (user) => user.filesCreated)
    creator!: User;
}