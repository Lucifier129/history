/// <reference path="../../src/type.d.ts" />
export declare const locationsAreEqual: import("./utils/type").Location.LocationsAreEqual;
import Actions from './utils/Actions';
declare const _default: {
    locationsAreEqual: import("./utils/type").Location.LocationsAreEqual;
    createHistory: import("./type").Browser.CreateHistory;
    createHashHistory: import("./type").Hash.CreateHistory;
    createMemoryHistory: import("./type").Memory.CreateHistory;
    useBasename: import("./type").Basename.UseBasename;
    useBeforeUnload: import("./type").BeforeUnload.UseBeforeUnload;
    useQueries: import("./type").Queries.useQueries;
    Actions: typeof Actions;
};
export default _default;
