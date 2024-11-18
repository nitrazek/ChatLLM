import { BeforeInsert, BeforeUpdate, Column, Entity, IsNull, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ExtendedBaseEntity } from "./extended_base_entity";
import { FileType } from "../enums/file_type";
import { User } from "./user";
import { IsEnum, Length, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { getIsInvalidMessage } from "../utils/model_validation_messages";

@ValidatorConstraint({ async: true })
class IsNameUniqueInParent implements ValidatorConstraintInterface {
    async validate(name: string, args: ValidationArguments): Promise<boolean> {
        const validatedFile = args.object as File;
        const files = await File.findBy({ parent: validatedFile.parent === null ? IsNull() : { id: validatedFile.parent.id } });
        return !files.map(file => file.name).includes(name);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return "File with this name already exists in the same folder";
    }
}

@Entity()
export class File extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Validate(IsNameUniqueInParent)
    @Length(1, 50, { message: getIsInvalidMessage('Name') })
    name!: string;

    @Column({ type: 'enum', enum: FileType })
    @IsEnum(FileType, { message: getIsInvalidMessage('Type') })
    type!: FileType;

    @ManyToOne(() => File, (file) => file.children, {
        nullable: true,
        onDelete: "CASCADE"
    })
    parent!: File | null;

    @OneToMany(() => File, (file) => file.parent, {
        cascade: true,
        onDelete: "CASCADE"
    })
    children!: File[];

    @ManyToOne(() => User, (user) => user.filesCreated, {
        nullable: true,
        onDelete: "SET NULL"
    })
    creator!: User | null;

    @Column()
    chunkAmount!: number;
}