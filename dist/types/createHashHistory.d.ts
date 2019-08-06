import { CreateHistoryFunc } from './createHistory';
export interface PathCoder {
    encodePath: (path: string) => string;
    decodePath: (path: string) => string;
}
export interface PathCoders {
    hashbang: PathCoder;
    noslash: PathCoder;
    slash: PathCoder;
}
declare const createHashHistory: CreateHistoryFunc;
export default createHashHistory;
