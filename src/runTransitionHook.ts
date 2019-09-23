import warning from 'warning'
import { NativeLocation } from './type'

export interface Callback {
  (result: any): void
}

export interface Hook<NL extends NativeLocation = NativeLocation> {
  (location: NL, callback?: Callback): any
}

export interface RunTransitionHook<NL extends NativeLocation = NativeLocation> {
  (
    hook: Hook<NL>, 
    location: NL, 
    callback: Callback
  ): void
}

const runTransitionHook: RunTransitionHook = (hook, location, callback) => {
  const result = hook(location, callback)

  if (hook.length < 2) {
    // Assume the hook runs synchronously and automatically
    // call the callback with the return value.
    callback(result)
  } else {
    warning(
      result === undefined,
      'You should not "return" in a transition hook with a callback argument; ' +
      'call the callback instead'
    )
  }
}

export default runTransitionHook
