/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 12:33:34 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 14:37:43
 */

enum  Actions {
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
export const PUSH: Actions = Actions.PUSH

export const REPLACE: Actions = Actions.REPLACE

export const POP: Actions = Actions.POP

export default Actions