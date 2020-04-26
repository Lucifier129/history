export interface Done {
  (...args: unknown[]): void
}

export interface Work {
  (
    currentTurn: number,
    next: () => void,
    done: Done
  ): void
}

export interface Callback {
  (...args: unknown[]): void
}

export function loopAsync(
  turns: number,
  work: Work,
  callback: Callback
): void {
  let currentTurn: number = 0
  let isDone: boolean = false
  let isSync: boolean = false
  let hasNext: boolean = false
  let doneArgs: unknown[] = []

  function done(...args: unknown[]): void {
    isDone = true

    if (isSync) {
      // Iterate instead of recursing if possible.
      doneArgs = args
      return
    }

    callback(...args)
  }

  function next(): void {
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
