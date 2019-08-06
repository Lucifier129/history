import CH, { HistoryOptions, NativeHistory } from './createHistory';
/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
declare const useQueries: (createHistory: typeof CH) => (options?: HistoryOptions) => NativeHistory;
export default useQueries;
