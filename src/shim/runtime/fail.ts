import process from 'node:process';

export const fail = (message: string): never => {
  console.error(message);

  return process.exit(1);
};
