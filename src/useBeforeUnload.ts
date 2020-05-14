import invariant from 'tiny-invariant'
import {
  addEventListener,
  removeEventListener
} from './DOMUtils'
import { canUseDOM } from './DOMUtils'
import type { Hook } from './runTransitionHook'
import type {
  CreateHistory,
  History,
  HistoryOptions,
  LTFromCH,
  LocationTypeMap,
  BaseLocation,
  Location,
  Unlisten,
  LocationType
} from './index'

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

export interface GetPromptMessage {
  (): unknown
}

export interface StopListener {
  (): void
}

function startListener(getPromptMessage: GetPromptMessage): StopListener {
  function handleBeforeUnload(event: BeforeUnloadEvent): void | string {
    const message = getPromptMessage()

    if (typeof message === 'string') {
      event.returnValue = message
      return message
    }

    return void 0
  }

  addEventListener(
    window,
    'beforeunload',
    handleBeforeUnload as EventListener
  )

  return () => (
    removeEventListener(
      window,
      'beforeunload',
      handleBeforeUnload as EventListener
    )
  )
}

/**
 * Returns a new createHistory function that can be used to create
 * history objects that know how to use the beforeunload event in web
 * browsers to cancel navigation.
 */
export default function useBeforeUnload<CH extends CreateHistory<any>>(
  createHistory: CH
): CreateHistoryWithBFOL<LTFromCH<CH>> {
  invariant(canUseDOM, 'useBeforeUnload only works in DOM environments')

  function ch<LT extends LocationType>(options?: HistoryOptions): HistoryWithBFOL<
    LocationTypeMap[LT]['Base'],
    LocationTypeMap[LT]['Intact']
  > {
    type BL = LocationTypeMap[LTFromCH<CH>]['Base']
    type IL = LocationTypeMap[LTFromCH<CH>]['Intact']
    
    const history: History<BL, IL> = createHistory(options)
    let hooks: Function[] = []
    let stopListener: Function | null

    function getPromptMessage(): unknown {
      let message
      for (let i = 0, len = hooks.length; message == null && i < len; ++i) {
        message = hooks[i]()
      }

      return message
    }

    function listenBeforeUnload(hook: Hook<IL>): Unlisten {
      if (hooks.push(hook) === 1) {
        stopListener = startListener(getPromptMessage)
      }

      return () => {
        hooks = hooks.filter(item => item !== hook)

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
