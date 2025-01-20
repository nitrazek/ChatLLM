import { validateOrReject } from "class-validator";
import { BaseEntity, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class ExtendedBaseEntity extends BaseEntity {
    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;

    @BeforeInsert()
    async validateOnInsert() {
        await validateOrReject(this)
    }

    @BeforeUpdate()
    async validateOnUpdate() {
        await validateOrReject(this, { skipMissingProperties: true })
    }
}