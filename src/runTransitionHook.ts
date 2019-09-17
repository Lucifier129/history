import warning from 'warning'
import { NativeLocation } from './LocationUtils'

export interface Callback {
  (result: any): void
}

export interface Hook {
  (location: NativeLocation, callback?: Callback): any
}

export interface RunTransitionHook {
  (
    hook: Hook, 
    location: NativeLocation, 
    callback?: Callback
  ): void
}

const runTransitionHook: RunTransitionHook = (hook, location, callback) => {
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

export default runTransitionHook
