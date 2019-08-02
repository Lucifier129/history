import { HistoryOptions, NativeHistory } from './createHistory';
export interface PathCoder {
    encodePath: (path: string) => string;
    decodePath: (path: string) => string;
}
export interface PathCoders {
    hashbang: PathCoder;
    noslash: PathCoder;
    slash: PathCoder;
}
declare const createHashHistory: (options: HistoryOptions) => NativeHistory;
export default createHashHistory;
