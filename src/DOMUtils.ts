export function addEventListener(
  node: Element | Window,
  event: string,
  listener: EventListener
): void {
  return (
    node.addEventListener
      ? node.addEventListener(event, listener, false)
      // @ts-ignore
      : node.attachEvent('on' + event, listener)
  )
}

export function removeEventListener(
  node: Element | Window,
  event: string,
  listener: EventListener
): void {
  return (
    node.removeEventListener
      ? node.removeEventListener(event, listener, false)
      // @ts-ignore
      : node.detachEvent('on' + event, listener)
  )
}
  

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
export function supportsHistory(): boolean {
  const ua: string = window.navigator.userAgent

  if (
    (ua.indexOf('Android 2.') !== -1
      || ua.indexOf('Android 4.0') !== -1)
    && ua.indexOf('Mobile Safari') !== -1
    && ua.indexOf('Chrome') === -1
    && ua.indexOf('Windows Phone') === -1
  ) {
    return false
  } else {
    return window.history && 'pushState' in window.history
  }
}

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
export function supportsGoWithoutReloadUsingHash(): boolean {
  return window.navigator.userAgent.indexOf('Firefox') === -1
}

export const canUseDOM: boolean = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)
