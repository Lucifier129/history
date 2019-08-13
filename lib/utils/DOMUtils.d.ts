export declare const addEventListener: Utils.DOMUtils.AddEventListener;
export declare const removeEventListener: Utils.DOMUtils.RemoveEventListener;
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
export declare const supportsHistory: Utils.DOMUtils.SupportsHistory;
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
export declare const supportsGoWithoutReloadUsingHash: Utils.DOMUtils.SupportsGoWithoutReloadUsingHash;
