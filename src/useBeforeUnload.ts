import invariant from "invariant"
import {
  addEventListener,
  removeEventListener
} from "./DOMUtils"
import { Hook } from './runTransitionHook'
import { canUseDOM } from "./DOMUtils"
import {
  CreateHistory,
  History,
  HistoryOptions,
  LTFromCH,
  LocationTypeMap,
  BaseLocation,
  Location,
  Unlisten,
  LocationType
} from "./type"

export interface ListenBeforeUnload<IL extends Location = Location> {
  (hook: Hook<IL>): Unlisten
}

export interface HistoryWithBFOL<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
> extends History<BL, IL> {
  listenBeforeUnload: ListenBeforeUnload<IL>
}

export interface CreateHistoryWithBFOL<LT extends LocationType> {
  (options?: HistoryOptions): HistoryWithBFOL<
    LocationTypeMap[LT]['Base'],
    LocationTypeMap[LT]['Intact']
  >
}

export interface UseBeforeUnload {
  <CH extends CreateHistory<any>>(
    createHistory: CH
  ): CreateHistoryWithBFOL<LTFromCH<CH>>
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

  addEventListener(
    window,
    "beforeunload",
    handleBeforeUnload as EventListener
  )

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
    const history: History = createHistory(options)
    type IL = LocationTypeMap[LTFromCH<CH>][""]
    let hooks: Function[] = []
    let stopListener: Function | null

    const getPromptMessage = () => {
      let message
      for (let i = 0, len = hooks.length; message == null && i < len; ++i)
        message = hooks[i]()

      return message
    }

    const listenBeforeUnload: ListenBeforeUnload<IL> = listener => {
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
