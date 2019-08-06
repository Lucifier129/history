/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 16:43:03 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 16:48:24
 */

import invariant from 'invariant'
import { addEventListener, removeEventListener } from './DOMUtils'
import { canUseDOM } from './ExecutionEnvironment'
import CH, { NativeHistory, HistoryOptions } from './createHistory';

const startListener: (getPromptMessage: () => boolean) => () => void
= (getPromptMessage) => {
  const handleBeforeUnload: (event: Event) => boolean = (event) => {
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
const useBeforeUnload: (createHistory: typeof CH) => (options: HistoryOptions) => NativeHistory = (createHistory) => {
  invariant(
    canUseDOM,
    'useBeforeUnload only works in DOM environments'
  )

  return (options: HistoryOptions) => {
    const history: NativeHistory = createHistory(options)

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
}

export default useBeforeUnload
