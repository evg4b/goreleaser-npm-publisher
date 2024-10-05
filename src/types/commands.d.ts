type ActionType<T = object> = (args: DefaultParams & T) => void | Promise<void>;
