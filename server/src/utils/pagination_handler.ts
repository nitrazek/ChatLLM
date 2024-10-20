import { PaginationMetadata } from "../schemas/base_schemas";
import { BadRequestError } from "../schemas/errors_schemas";

export const getPaginationMetadata = (page: number, limit: number, totalAmount: number): PaginationMetadata => {
    const totalPages = Math.ceil(totalAmount / limit);
    return {
        totalPages: totalPages,
        currentPage: page,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null
    }
};