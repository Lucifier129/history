import { Location } from './LocationUtils';
export declare const getCurrentLocation: () => Location;
export declare const getUserConfirmation: (message: string, callback: Function) => any;
export declare const startListener: (listener: Function) => () => void;
export declare const pushLocation: (location: Location) => void;
export declare const replaceLocation: (location: Location) => void;
export declare const go: (n: number) => void;
