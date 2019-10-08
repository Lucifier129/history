import warning from 'warning'
import { Location } from './type'

export interface Callback {
  (result: any): void
}

export interface Hook<IL extends Location = Location> {
  (location: IL, callback?: Callback): any
}

export interface RunTransitionHook<IL extends Location = Location> {
  (
    hook: Hook<IL>, 
    location: IL, 
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
