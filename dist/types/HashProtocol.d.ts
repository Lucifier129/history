import { Location } from './LocationUtils';
import { PathCoder } from './createHashHistory';
export declare let getUserConfirmation: (message: string, callback: Function) => any;
export declare let go: (n: number) => void;
export declare const getCurrentLocation: (pathCoder: PathCoder, queryKey: string) => Location;
export declare const startListener: (listener: Function, pathCoder: PathCoder, queryKey: string) => () => void;
export declare const pushLocation: (location: Location, pathCoder: PathCoder, queryKey: string) => void;
export declare const replaceLocation: (location: Location, pathCoder: PathCoder, queryKey: string) => void;
