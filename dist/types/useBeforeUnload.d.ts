import CH, { NativeHistory, HistoryOptions } from './createHistory';
/**
 * Returns a new createHistory function that can be used to create
 * history objects that know how to use the beforeunload event in web
 * browsers to cancel navigation.
 */
declare const useBeforeUnload: (createHistory: typeof CH) => (options: HistoryOptions) => NativeHistory;
export default useBeforeUnload;
