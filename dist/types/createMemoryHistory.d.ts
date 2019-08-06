import { HistoryOptions, CreateHistoryFunc } from './createHistory';
export interface Memo {
    [propName: string]: any;
}
export interface MemoryOptions extends HistoryOptions {
    entries?: any;
    current?: number;
}
declare const createMemoryHistory: CreateHistoryFunc;
export default createMemoryHistory;
