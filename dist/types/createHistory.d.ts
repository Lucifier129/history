import { createPath } from './PathUtils';
import { createLocation, Location } from './LocationUtils';
import { createKey } from './DOMStateStorage';
export interface GetCurrentLocationFunc {
    (): Location;
}
export interface HistoryOptions {
    getCurrentLocation?: GetCurrentLocationFunc;
    getUserConfirmation?: Function;
    pushLocation?: Function;
    replaceLocation?: Function;
    go?: (delta?: number) => void;
    keyLength?: number;
    forceRefresh?: boolean;
    queryKey?: string;
    hashType?: string;
    basename?: string;
    stringifyQuery?: Function;
    parseQueryString?: Function;
}
export interface NativeHistory {
    getCurrentLocation: GetCurrentLocationFunc;
    listenBefore: Function;
    listen: Function;
    transitionTo: Function;
    push: Function;
    replace: Function;
    go: (delta?: number) => void;
    goBack: () => void;
    goForward: () => void;
    createKey: typeof createKey;
    createPath: typeof createPath;
    createHref: Function;
    createLocation: typeof createLocation;
}
declare const createHistory: (options?: HistoryOptions) => NativeHistory;
export default createHistory;
