import { Injectable } from '@nestjs/common';

@Injectable()
export class CursorPaginationService {
  generateCursor(cursor: string, limit: number) {
    const take = limit + 1;

    if (!cursor) return { take, cursor: undefined };

    return { take, cursor: { id: cursor }, skip: 1 };
  }

  getMetadata<T extends { id: string }>(items: T[], limit: number) {
    const hasNextPage = items.length > limit;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;
    const newItems = hasNextPage ? items.slice(0, limit) : items;

    return { hasNextPage, nextCursor, items: newItems };
  }
}
