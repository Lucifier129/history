/**
 * History change state need this indication to distinguish which type.
 */
declare enum Actions {
    /**
     * Indicates that navigation was caused by a call to history.push.
     */
    PUSH = 0,
    /**
     * Indicates that navigation was caused by a call to history.replace.
     */
    REPLACE = 1,
    /**
     * Indicates that navigation was caused by some other action such
     * as using a browser's back/forward buttons and/or manually manipulating
     * the URL in a browser's location bar. This is the default.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
     * for more information.
     */
    POP = 2
}
export default Actions;
export declare const PUSH = Actions.PUSH;
export declare const REPLACE = Actions.REPLACE;
export declare const POP = Actions.POP;
