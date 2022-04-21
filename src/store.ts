import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosValue triggers component re-rendering when state updated.
 */

const store: WeakMap<
  Atom<any>,
  { hasInit: boolean; value: any; stateBucket?: Map<symbol, () => void> }
> = new WeakMap();

class Atom<T> {
  constructor(value: T) {
    this.value = value;
  }
  value: T;
}

export const atom = <T>(state: T): Atom<T> => {
  return new Atom<T>(state);
};

export const useLosValue = <T>(atom: Atom<T>) => {
  const [id] = React.useState(Symbol());

  if (!store.has(atom)) {
    store.set(atom, {
      hasInit: false,
      value: atom.value,
      stateBucket: new Map(),
    });
  }

  React.useEffect(() => {
    return () => {
      // @ts-ignore
      store.get(atom).stateBucket.delete(id);
    };
  });

  return useSyncExternalStore(
    // @ts-ignore
    (l) => () => store.get(atom).stateBucket.set(id, l),
    // @ts-ignore
    () => store.get(atom).value
  );
};

type SetStateFunction<T> = (state: T) => T;
export const useSetLosState = <T>(atom: Atom<T>) => {
  if (!store.has(atom)) {
    store.set(atom, { hasInit: false, value: atom.value, stateBucket: new Map() });
  }

  return (state: T | SetStateFunction<T>) => {
    store.set(atom, {
      hasInit: false,
      // @ts-ignore
      value: typeof state === 'function' ? state(store.get(atom).value) : state,
      // @ts-ignore
      stateBucket: store.get(atom).stateBucket ?? new Map(),
    });

    // @ts-ignore
    store.get(atom).stateBucket.forEach((fn) => fn());
  };
};

export const useLosState = <T>(atom: Atom<T>) => {
  return [useLosValue(atom), useSetLosState(atom)];
};

export const initLosState = <T>(state: Atom<T>, defaultValue: T, allowReinitialize?: boolean) => {
  if (!store.has(state) || allowReinitialize) {
    store.set(state, { hasInit: true, value: defaultValue, stateBucket: new Map() });
    // @ts-ignore
    store.get(state).stateBucket.forEach((fn) => fn());
  } else if (store.has(state)) {
    // @ts-ignore
    if (!store.get(state).hasInit) {
      store.set(state, {
        hasInit: true,
        value: defaultValue,
        // @ts-ignore
        stateBucket: store.get(state).stateBucket ?? new Map(),
      });
      // @ts-ignore
      store.get(state).stateBucket.forEach((fn) => fn());
    }
  }
};

export const useInitLosState = <T>(atom: Atom<T>, defaultValue: T, allowReinitialize?: boolean) => {
  initLosState(atom, defaultValue, allowReinitialize);

  return [useLosValue(atom), useSetLosState(atom)];
};
