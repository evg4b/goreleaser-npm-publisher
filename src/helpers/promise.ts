export const tap = <T>(action: (value: T) => unknown) => {
  return (a: T) => {
    action(a);
    return a;
  };
};

export const tapAndRethrow = (action: (value: unknown) => unknown) => {
  return (error: unknown): never => {
    action(error);
    throw error;
  };
};
