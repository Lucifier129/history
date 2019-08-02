/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 12:30:54 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 12:33:43
 */

interface Work {
  (currentTurn: number, next: () => void, done: (...args: any[]) => void): void
}
interface Callback {
  (...args: any[]): void
}

export const loopAsync: (turns: number, work: Work, callback: Callback) => void 
= (turns, work, callback) => {
  let currentTurn: number = 0
  let isDone: boolean = false
  let isSync: boolean = false
  let hasNext: boolean = false
  let doneArgs: any[]

  const done = (...args) => {
    isDone = true

    if (isSync) {
      // Iterate instead of recursing if possible.
      doneArgs = args
      return
    }

    callback(...args)
  }

  const next: () => void = () => {
    if (isDone)
      return

    hasNext = true

    if (isSync)
      return // Iterate instead of recursing if possible.

    isSync = true

    while (!isDone && currentTurn < turns && hasNext) {
      hasNext = false
      work(currentTurn++, next, done)
    }

    isSync = false

    if (isDone) {
      // This means the loop finished synchronously.
      callback(...doneArgs)
      return
    }

    if (currentTurn >= turns && hasNext) {
      isDone = true
      callback()
    }
  }

  next()
}
