import { PaginationMetadata } from "../schemas/base_schemas";

export const getPaginationMetadata = (page: number, limit: number, totalAmount: number): PaginationMetadata => {
    const totalPages = Math.max(Math.ceil(totalAmount / limit), 1);
    return {
        totalPages: totalPages,
        currentPage: page,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null
    }
};