interface Work {
    (currentTurn: number, next: () => void, done: (...args: any[]) => void): void;
}
interface Callback {
    (...args: any[]): void;
}
export declare const loopAsync: (turns: number, work: Work, callback: Callback) => void;
export {};
