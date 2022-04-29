import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Atom, store } from '../store';

export const useLosValue = <T>(atom: Atom<T>): T => {
  const [id] = React.useState(Symbol());

  React.useEffect(() => {
    return () => {
      // @ts-ignore
      store.get(atom).stateBucket.delete(id);
    };
  });

  return useSyncExternalStore(
    // @ts-ignore
    (subscribeFn) => () => store.get(atom).stateBucket.set(id, subscribeFn),
    // @ts-ignore
    () => store.get(atom).value
  );
};

type SetStateFunction<T> = (state: T) => T;
export type SetLosState<T> = (state: T | SetStateFunction<T>) => void;
export const useSetLosState = <T>(atom: Atom<T>): SetLosState<T> => {
  return (state: T | SetStateFunction<T>) => {
    store.set(atom, {
      // @ts-ignore
      hasInit: store.get(atom).stateBucket ?? false,
      // @ts-ignore
      value: typeof state === 'function' ? state(store.get(atom).value) : state,
      // @ts-ignore
      stateBucket: store.get(atom).stateBucket ?? new Map(),
    });

    // @ts-ignore
    store.get(atom).stateBucket.forEach((fn) => fn());
  };
};

export const useLosState = <T>(atom: Atom<T>): [T, SetLosState<T>] => {
  return [useLosValue(atom), useSetLosState(atom)];
};
