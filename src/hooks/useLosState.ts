import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Atom, Computed, store } from '../store';
import mergeStoreItem from '../utils/mergeStoreItem';
import pushSubscribe from '../utils/pushSubscribe';
import { Subscribe } from '../utils/createSubscribe';

export const useLosValue = <T, A = void>(state: Atom<T, A> | Computed<T>): T => {
  if (!(state instanceof Atom) && !(state instanceof Computed)) {
    throw new Error('useLosValue: state must be an Atom or a Computed');
  }

  let subscribe: Subscribe;
  if (state instanceof Atom) {
    subscribe = store.get(state)!.subscribe;
  } else {
    const { originAtoms } = state;
    subscribe = (subscribeFn) => {
      originAtoms.forEach((atom) => {
        store.get(atom)!.stateBucket.add(subscribeFn);
      });
      return () => {
        originAtoms.forEach((atom) => {
          store.get(atom)!.stateBucket.delete(subscribeFn);
        });
      };
    };
  }

  const snapshot = React.useCallback(() => {
    if (state instanceof Atom) {
      return store.get(state)!.value;
    } else {
      return state.value;
    }
  }, []);

  const value = useSyncExternalStore(subscribe, snapshot);

  React.useDebugValue(value);

  return value as T;
};

type SetStateFunction<T> = (state: T) => T;
export type SetLosState<T> = (state: T | SetStateFunction<T>) => void;
export const setLosState = <T, A = void>(state: Atom<T, A> | Computed<T>): SetLosState<T> => {
  // todo support Computed
  return (newState: T | SetStateFunction<T>) => {
    mergeStoreItem(state, {
      // now that we start updating state, we can confirm that the atom has been initialized
      hasInit: true,
      // @ts-ignore
      value: typeof newState === 'function' ? newState(store.get(state)!.value) : newState,
    });

    pushSubscribe(state);
  };
};

export const useSetLosState = setLosState;

export const useLosState = <T, A = void>(atom: Atom<T, A>): [T, SetLosState<T>] => {
  return [useLosValue(atom), setLosState(atom)];
};
