export const assertNotEmpty = (value?: string | unknown[] | null, message?: string): void => {
  if (!value?.length) {
    throw new Error(message ?? `Value should not be empty`);
  }
};
