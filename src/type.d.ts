export interface PathCoder {
  encodePath: (path: string) => string;
  decodePath: (path: string) => string;
}

export interface PathCoders {
  hashbang: PathCoder;
  noslash: PathCoder;
  slash: PathCoder;
}

export interface StringifyQuery {
  (query: object): string
}

export interface ParseQueryString {
  (query: string): object
}

export interface HistoryOptions {
  keyLength: number
  forceRefresh: boolean
  queryKey: string
  hashType: keyof PathCoders
  basename: string
  stringifyQuery: StringifyQuery
  parseQueryString: ParseQueryString
}