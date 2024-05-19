import { FastifyReply, FastifyRequest, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";

export type CustomRequest<T, K> = FastifyRequest<{ Body: T, Reply: K }>;
export type CustomReply<T, K> = FastifyReply<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, { Body: T, Reply: K }>