import warning from 'warning'
import { Location } from './LocationUtils'

const runTransitionHook: (hook: Function, location: Location, callback: Function) => void
= (hook, location, callback) => {
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
