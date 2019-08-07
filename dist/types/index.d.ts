export declare const locationsAreEqual: (a: import("./LocationUtils").Location, b: import("./LocationUtils").Location) => boolean;
import { default as Actions } from './Actions';
export { Work, Callback } from './AsyncUtils';
export { PathCoder, PathCoders } from './createHashHistory';
export { GetCurrentLocationFunc, HistoryOptions, NativeHistory, CreateHistoryFunc } from './createHistory';
export { Memo } from './createMemoryHistory';
export { Location } from './LocationUtils';
declare const _default: {
    locationsAreEqual: (a: import("./LocationUtils").Location, b: import("./LocationUtils").Location) => boolean;
    createHistory: import("./createHistory").CreateHistoryFunc;
    createHashHistory: import("./createHistory").CreateHistoryFunc;
    createMemoryHistory: import("./createHistory").CreateHistoryFunc;
    useBasename: (createHistory: import("./createHistory").CreateHistoryFunc) => (options: import("./createHistory").HistoryOptions) => import("./createHistory").NativeHistory;
    useBeforeUnload: (createHistory: import("./createHistory").CreateHistoryFunc) => (options: import("./createHistory").HistoryOptions) => import("./createHistory").NativeHistory;
    useQueries: (createHistory: import("./createHistory").CreateHistoryFunc) => (options?: import("./createHistory").HistoryOptions) => import("./createHistory").NativeHistory;
    Actions: typeof Actions;
};
export default _default;
