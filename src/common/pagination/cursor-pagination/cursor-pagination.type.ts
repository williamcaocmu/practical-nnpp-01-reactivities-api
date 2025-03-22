export type CursorPaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};
