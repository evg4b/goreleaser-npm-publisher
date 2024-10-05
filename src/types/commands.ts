// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ActionType<T = object> = (args: DefaultParams & T) => void | Promise<void>;
