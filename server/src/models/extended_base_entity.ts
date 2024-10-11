import { validate, validateOrReject, ValidationError } from "class-validator";
import { FastifyError } from "fastify";
import { BaseEntity, BeforeInsert, BeforeUpdate } from "typeorm";

export class ExtendedBaseEntity extends BaseEntity {
    @BeforeInsert()
    async validateOnInsert() {
        await validateOrReject(this)
    }

    @BeforeUpdate()
    async validateOnUpdate() {
        await validateOrReject(this, { skipMissingProperties: true })
    }
}