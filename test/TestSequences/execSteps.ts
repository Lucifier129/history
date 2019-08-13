import { Step, Done } from '../type'
import CH from '../../src'

const execSteps: (
  steps: Step[],
  history: CH.NativeHistory,
  done: Done
) => void = (steps, history, done) => {
  let index: number = 0
  let unlisten: Function

  const cleanup = (...args) => {
    unlisten()
    done(...args)
  }

  const execNextStep = (...args) => {
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
