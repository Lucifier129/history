import invariant from 'invariant'
import { addEventListener, removeEventListener } from './DOMUtils'
import { canUseDOM } from './ExecutionEnvironment'
import CH from './index'

export interface StartListener {
  (getPromptMessage: () => boolean): Function
}
export interface HandleBeforeUnload {
  (event: Event): boolean
}
export interface UseBeforeUnload {
  (createHistory: CH.CreateHistory): CH.CreateHistory
}

const startListener: StartListener = (getPromptMessage) => {
  const handleBeforeUnload: HandleBeforeUnload = (event) => {
    const message: boolean = getPromptMessage()

    if (typeof message === 'string') {
      (event || window.event).returnValue = message
      return message
    }

    return undefined
  }

  addEventListener(window, 'beforeunload', handleBeforeUnload)

  return () =>
    removeEventListener(window, 'beforeunload', handleBeforeUnload)
}

/**
 * Returns a new createHistory function that can be used to create
 * history objects that know how to use the beforeunload event in web
 * browsers to cancel navigation.
 */
const useBeforeUnload: UseBeforeUnload = (createHistory) => {
  invariant(
    canUseDOM,
    'useBeforeUnload only works in DOM environments'
  )

  const ch = (options) => {
    const history: CH.NativeHistory = createHistory(options)

    let hooks: Function[] = []
    let stopListener: Function

    const getPromptMessage = () => {
      let message
      for (let i = 0, len = hooks.length; message == null && i < len; ++i)
        message = hooks[i].call(this)

      return message
    }

    const listenBeforeUnload = (listener) => {
      if (hooks.push(listener) === 1)
        stopListener = startListener(getPromptMessage)

      return () => {
        hooks= hooks.filter(item => item !== listener)

        if (hooks.length === 0 && stopListener) {
          stopListener()
          stopListener = null
        }
      }
    }

    return {
      ...history,
      listenBeforeUnload
    }
  }

  return ch
}

export default useBeforeUnload
