import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Atom, store } from '../store';
import mergeStoreItem from '../utils/mergeStoreItem';
import pushSubscribe from '../utils/pushSubscribe';

export const useLosValue = <T, A = void>(atom: Atom<T, A>): T => {
  const value = useSyncExternalStore(
    store.get(atom)!.subscribe,
    React.useCallback(() => store.get(atom)!.value, [atom])
  );

  React.useDebugValue(value);

  return value;
};

type SetStateFunction<T> = (state: T) => T;
export type SetLosState<T> = (state: T | SetStateFunction<T>) => void;
export const useSetLosState = <T, A = void>(atom: Atom<T, A>): SetLosState<T> => {
  return (state: T | SetStateFunction<T>) => {
    mergeStoreItem(atom, {
      // now that we start updating state, we can confirm that the atom has been initialized
      hasInit: true,
      // @ts-ignore
      value: typeof state === 'function' ? state(store.get(atom)!.value) : state,
    });

    pushSubscribe(atom);
  };
};

export const useLosState = <T, A = void>(atom: Atom<T, A>): [T, SetLosState<T>] => {
  return [useLosValue(atom), useSetLosState(atom)];
};
