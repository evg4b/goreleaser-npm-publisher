export const tap = <T>(action: (value: T) => unknown) => {
  return (a: T) => (action(a), a);
};
