import { NativeHistory } from '../../src'
import { Step, Done } from '../type'

const execSteps: (
  steps: Step[],
  history: NativeHistory,
  done: Done
) => void = (steps, history, done) => {
  let index: number = 0
  let unlisten: Function

  const cleanup = (...args: any[]) => {
    unlisten()
    done(...args)
  }

  const execNextStep = (location: any) => {
    try {
      steps[index++](location)

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
