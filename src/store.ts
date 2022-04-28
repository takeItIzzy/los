import * as React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosValue triggers component re-rendering when state updated.
 */

const store: Map<
  Atom<any>,
  { hasInit: boolean; value: any; stateBucket?: Map<symbol, () => void> }
> = new Map();

class Atom<T> {
  constructor(value: T) {
    this.value = value;
  }
  value: T;
}

export const atom = <T>(state: T): Atom<T> => {
  const atomItem = new Atom(state);

  store.set(atomItem, {
    hasInit: false,
    value: atomItem.value,
    stateBucket: new Map(),
  });

  return atomItem;
};

export const useLosValue = <T>(atom: Atom<T>) => {
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
export const useSetLosState = <T>(atom: Atom<T>) => {
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

export const useLosState = <T>(atom: Atom<T>) => {
  return [useLosValue(atom), useSetLosState(atom)];
};

export const initLosState = <T>(state: Atom<T>, defaultValue: T, allowReinitialize?: boolean) => {
  if (allowReinitialize) {
    store.set(state, { hasInit: true, value: defaultValue, stateBucket: new Map() });
    // @ts-ignore
    store.get(state).stateBucket.forEach((fn) => fn());
    // @ts-ignore
  } else if (!store.get(state).hasInit) {
    store.set(state, {
      hasInit: true,
      value: defaultValue,
      // @ts-ignore
      stateBucket: store.get(state).stateBucket ?? new Map(),
    });
    // @ts-ignore
    store.get(state).stateBucket.forEach((fn) => fn());
  }
};

export const useInitLosState = <T>(atom: Atom<T>, defaultValue: T, allowReinitialize?: boolean) => {
  initLosState(atom, defaultValue, allowReinitialize);

  return [useLosValue(atom), useSetLosState(atom)];
};
