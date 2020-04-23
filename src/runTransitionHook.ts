import warning from 'tiny-warning'
import type { Location } from './index'

export interface Callback {
  (result: unknown): void
}

export interface Hook<IL extends Location = Location> {
  (
    location: IL,
    callback?: Callback
  ): unknown
}

export default function runTransitionHook<IL extends Location = Location>(
  hook: Hook<IL>, 
  location: IL, 
  callback?: Callback
): void {
  const result = hook(location, callback)

  if (hook.length < 2) {
    // Assume the hook runs synchronously and automatically
    // call the callback with the return value.
    callback && callback(result)
  } else {
    warning(
      result === undefined,
      'You should not "return" in a transition hook with a callback argument; ' +
      'call the callback instead'
    )
  }
}