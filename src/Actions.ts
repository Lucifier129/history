/**
 * History change state need this indication to distinguish which type.
 */
enum Actions {
  /**
   * Indicates that navigation was caused by a call to history.push.
   */
  PUSH,
  /**
   * Indicates that navigation was caused by a call to history.replace.
   */
  REPLACE,
  /**
   * Indicates that navigation was caused by some other action such
   * as using a browser's back/forward buttons and/or manually manipulating
   * the URL in a browser's location bar. This is the default.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
   * for more information.
   */
  POP
}

export default Actions

export const PUSH = Actions.PUSH
export const REPLACE = Actions.REPLACE
export const POP = Actions.POP