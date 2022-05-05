import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Atom, Computed, store } from '../store';
import { Subscribe } from '../utils/createSubscribe';
import updateStoreItem from '../utils/updateStoreItem';
import { __DEV__ } from '../constants';
import { error } from '../utils/warn';

export const useLosValue = <T, A = void>(state: Atom<T, A> | Computed<T>): T => {
  if (__DEV__ && !(state instanceof Atom) && !(state instanceof Computed)) {
    error('useLosValue: state must be an Atom or a Computed');
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
  if (__DEV__ && !(state instanceof Atom) && !(state instanceof Computed)) {
    error('setLosState: state must be an Atom or a Computed');
  }

  let update: SetLosState<T>;
  if (state instanceof Atom) {
    update = (newState: T | SetStateFunction<T>) => {
      updateStoreItem(state, {
        // now that we start updating state, we can confirm that the atom has been initialized
        hasInit: true,
        // @ts-ignore
        value: typeof newState === 'function' ? newState(store.get(state)!.value) : newState,
      });
    };
  } else {
    const { setter, stateProvider } = state;
    update = (newState: T | SetStateFunction<T>) => {
      // @ts-ignore
      const newValue = typeof newState === 'function' ? newState(state.value) : newState;
      setter?.(
        {
          get: stateProvider,
          set: (atom, value) => {
            updateStoreItem(atom, {
              // now that we start updating state, we can confirm that the atom has been initialized
              hasInit: true,
              value,
            });
          },
        },
        newValue
      );
    };
  }

  return update;
};

export const useSetLosState = setLosState;

export const useLosState = <T, A = void>(state: Atom<T, A> | Computed<T>): [T, SetLosState<T>] => {
  return [useLosValue(state), setLosState(state)];
};
