import invariant from "invariant"
import { addEventListener, removeEventListener } from "./DOMUtils"
import { Hook } from './runTransitionHook'
import { canUseDOM } from "./DOMUtils"
import {
  CreateHistory,
  NativeHistory,
  HistoryOptions,
  LTFromCH,
  LocationTypeMap,
  BaseLocation,
  NativeLocation,
  Unlisten,
  LocationType
} from "./type"

export interface ListenBeforeUnload<NL extends NativeLocation = NativeLocation> {
  (hook: Hook<NL>): Unlisten
}

export interface NativeHistoryWithBFOL<BL extends BaseLocation = BaseLocation, NL extends NativeLocation = NativeLocation> extends NativeHistory<BL, NL> {
  listenBeforeUnload: ListenBeforeUnload<NL>
}

export interface CreateHistoryWithBFOL<LT extends LocationType> {
  (options?: HistoryOptions): NativeHistoryWithBFOL<LocationTypeMap[LT]['Base'], LocationTypeMap[LT]['Native']>
}

export interface UseBeforeUnload {
  <CH extends CreateHistory<any>>(createHistory: CH): CreateHistoryWithBFOL<LTFromCH<CH>>
}

export interface GetPromptMessage {
  (): any
}

export interface StopListener {
  (): void
}

export interface StartListener {
  (getPromptMessage: GetPromptMessage): StopListener
}

export interface BeforeUnloadEventListener {
  (event: BeforeUnloadEvent): void
}

const startListener: StartListener = getPromptMessage => {
  const handleBeforeUnload: BeforeUnloadEventListener = event => {
    const message = getPromptMessage()

    if (typeof message === "string") {
      event.returnValue = message
      return message
    }

    return undefined
  }

  addEventListener(window, "beforeunload", handleBeforeUnload as EventListener)

  return () =>
    removeEventListener(
      window,
      "beforeunload",
      handleBeforeUnload as EventListener
    )
}

/**
 * Returns a new createHistory function that can be used to create
 * history objects that know how to use the beforeunload event in web
 * browsers to cancel navigation.
 */
const useBeforeUnload: UseBeforeUnload = <CH extends CreateHistory<any>>(
  createHistory: CH
) => {
  invariant(canUseDOM, "useBeforeUnload only works in DOM environments")

  const ch: CreateHistoryWithBFOL<LTFromCH<CH>> = (
    options: HistoryOptions = { hashType: "slash" }
  ) => {
    const history: NativeHistory = createHistory(options)
    type NL = LocationTypeMap[LTFromCH<CH>]["Native"]
    let hooks: Function[] = []
    let stopListener: Function | null

    const getPromptMessage = () => {
      let message
      for (let i = 0, len = hooks.length; message == null && i < len; ++i)
        message = hooks[i]()

      return message
    }

    const listenBeforeUnload: ListenBeforeUnload<NL> = listener => {
      if (hooks.push(listener) === 1) {
        stopListener = startListener(getPromptMessage)
      }

      return () => {
        hooks = hooks.filter(item => item !== listener)

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
