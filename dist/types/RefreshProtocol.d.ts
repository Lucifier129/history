import { Location } from './LocationUtils';
export declare let getUserConfirmation: (message: string, callback: Function) => any;
export declare let go: (n: number) => void;
export declare const getCurrentLocation: () => Location;
export declare const pushLocation: (location: Location) => boolean;
export declare const replaceLocation: (location: Location) => boolean;
