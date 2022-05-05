import { __DEV__ } from '../constants';

const noop: (message: string) => void = () => {};

export let warn = noop;
export let error = noop;

if (__DEV__) {
  warn = (message: string) => {
    console.warn(`[los] ${message}`);
  };
  error = (message: string) => {
    console.error(`[los] ${message}`);
  };
}
