/// <reference path="./type.d.ts" />
import invariant from 'invariant'
import { addEventListener, removeEventListener } from './utils/DOMUtils'
import { canUseDOM } from './utils/ExecutionEnvironment'

const startListener: CH.BeforeUnload.StartListener = (getPromptMessage) => {
  const handleBeforeUnload: CH.BeforeUnload.HandleBeforeUnload = (event) => {
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
const useBeforeUnload: CH.BeforeUnload.UseBeforeUnload = (createHistory) => {
  invariant(
    canUseDOM,
    'useBeforeUnload only works in DOM environments'
  )

  const ch = (options) => {
    const history: CH.NativeHistory = createHistory(options)

    let listeners: Function[] = []
    let stopListener: Function

    const getPromptMessage = () => {
      let message
      for (let i = 0, len = listeners.length; message == null && i < len; ++i)
        message = listeners[i].call(this)

      return message
    }

    const listenBeforeUnload = (listener) => {
      if (listeners.push(listener) === 1)
        stopListener = startListener(getPromptMessage)

      return () => {
        listeners = listeners.filter(item => item !== listener)

        if (listeners.length === 0 && stopListener) {
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
