import { Location } from './LocationUtils';
export declare const addQueryStringValueToPath: (path: string, key: string, value: string) => string;
export declare const stripQueryStringValueFromPath: (path: string, key?: string) => string;
export declare const getQueryStringValueFromPath: (path: string, key: string) => string;
export declare const parsePath: (path: string) => Location;
export declare const createPath: (location?: Location | string) => string;
