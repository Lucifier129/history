import Actions from './Actions';
export interface Location {
    basename?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    state?: any;
    key?: string;
    action?: any;
    query?: object;
}
export declare const createQuery: (props: object) => object;
export declare const createLocation: (input: string | Location, action?: Actions, key?: string) => Location;
export declare const statesAreEqual: (a: any, b: any) => boolean;
export declare const locationsAreEqual: (a: Location, b: Location) => boolean;
