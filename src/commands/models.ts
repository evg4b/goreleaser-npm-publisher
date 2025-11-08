export type ActionType<T> = (args: T) => void | Promise<void>;
export interface PackageMapping {
  name: string[];
  bin: string;
}
