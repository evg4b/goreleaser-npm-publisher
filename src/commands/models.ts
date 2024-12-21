export type ActionType<T> = (args: T) => void | Promise<void>;
