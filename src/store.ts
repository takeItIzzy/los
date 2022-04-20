import * as React from 'react';

/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosState triggers component re-rendering when state updated.
 */

const store: WeakMap<Atom<any>, any> = new WeakMap();

const useForceUpdate = () => {
  const [, setState] = React.useState(0);
  return () => setState(state => state + 1);
};

class Atom<T> {
  constructor(value: T) {
    this.value = value;
  };
  value: T;
}

export const atom = <T>(state: T): Atom<T> => {
  return new Atom<T>(state);
};

const stateStack: Set<() => void> = new Set();

export const useLosValue = <T>(atom: Atom<T>) => {
  const forceUpdate = useForceUpdate();

  if (!store.has(atom)) {
    store.set(atom, atom.value);
  }

  const updateFn = () => {
    forceUpdate();
  };

  stateStack.add(updateFn);

  return store.get(atom);
};

type SetStateFunction<T> = (state: T) => T;
export const useSetLosState = <T>(atom: Atom<T>) => {
  if (!store.has(atom)) {
    store.set(atom, atom.value);
  }

  return (state: T | SetStateFunction<T>) => {
    if (typeof state === 'function') {
      // @ts-ignore
      store.set(atom, state(store.get(atom)));
    } else {
      store.set(atom, state);
    }

    stateStack.forEach(fn => fn());
  };
};

export const useLosState = <T>(atom: Atom<T>) => {
  return [useLosValue(atom), useSetLosState(atom)];
};

const init = <T>(state: Atom<T>, defaultValue: T, allowReinitialize?: boolean) => {
  if (!store.has(state) || allowReinitialize) {
    store.set(state, defaultValue);
  }
}
