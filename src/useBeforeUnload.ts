import invariant from 'invariant'
import { addEventListener, removeEventListener } from './DOMUtils'
import { canUseDOM } from './DOMUtils'
import { CreateHistory, NativeHistory, ListenBeforeUnload, HistoryOptions } from './type'

export interface GetPromptMessage {
  (): any
}

export interface StopListener {
  (): void
}

export interface StartListener {
  (getPromptMessage: GetPromptMessage): StopListener
}

export interface UseBeforeUnload {
  (createHistory: CreateHistory): CreateHistory
}

export interface BeforeUnloadEventListener {
  (event: BeforeUnloadEvent): void
}

const startListener: StartListener = (getPromptMessage) => {
  const handleBeforeUnload: BeforeUnloadEventListener = (event) => {
    const message = getPromptMessage()

    if (typeof message === 'string') {
      event.returnValue = message
      return message
    }

    return undefined
  }

  addEventListener(window, 'beforeunload', handleBeforeUnload as EventListener)

  return () =>
    removeEventListener(window, 'beforeunload', handleBeforeUnload as EventListener)
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

  const ch: CreateHistory = (options: HistoryOptions = { hashType: 'slash' }) => {
    const history: NativeHistory = createHistory(options)

    let hooks: Function[] = []
    let stopListener: Function | null

    const getPromptMessage = () => {
      let message
      for (let i = 0, len = hooks.length; message == null && i < len; ++i)
        message = hooks[i]()

      return message
    }

    const listenBeforeUnload: ListenBeforeUnload = (listener) => {
      if (hooks.push(listener) === 1) {
        stopListener = startListener(getPromptMessage)
      }

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
