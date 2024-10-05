export const tap = <T>(action: () => unknown) => {
  return (a: T) => {
    action();
    return a;
  };
};
