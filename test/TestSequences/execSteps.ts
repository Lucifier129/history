import { NativeHistory } from '../../src/createHistory'
import { Step, Done } from '../type'

const execSteps: (
  steps: Step[],
  history: NativeHistory,
  done: Done,
  mark?: boolean
) => void = (steps, history, done, mark) => {
  let index: number = 0
  let unlisten: Function

  const cleanup = (...args) => {
    unlisten()
    done(...args)
  }

  const execNextStep = (...args) => {
    if (mark) {
      console.log(index)
    }
    try {
      steps[index++](...args)

      if (index === steps.length)
        cleanup()
    } catch (error) {
      cleanup(error)
    }
  }

  if (steps.length > 0) {
    unlisten = history.listen(execNextStep)
    execNextStep(history.getCurrentLocation())
  } else {
    done()
  }
}

export default execSteps
