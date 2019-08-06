import CH, { HistoryOptions, NativeHistory } from './createHistory';
declare const useBasename: (createHistory: typeof CH) => (options: HistoryOptions) => NativeHistory;
export default useBasename;
