interface IPaginated<T> {
  data: T[];
  count: number;
  total: number;
}

export class Paginated<T> implements IPaginated<T> {
  data: T[];
  count: number;
  total: number;

  constructor(data: T[], count: number, total: number) {
    this.data = data;
    this.count = count;
    this.total = total;
  }

  map<U>(fn: (item: T) => U): Paginated<U> {
    return new Paginated<U>(this.data.map(fn), this.count, this.total);
  }
}

export function parseOffsetAndLimit(offset?: string, limit?: string) {
  const offsetNum = Number(offset);
  const limitNum = Number(limit);
  return {
    offset: isNaN(offsetNum) ? undefined : offsetNum,
    limit: isNaN(limitNum) ? undefined : limitNum,
  };
}
