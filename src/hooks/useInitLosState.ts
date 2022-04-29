import { Atom, store } from '../store';
import { SetLosState, useLosValue, useSetLosState } from './useLosState';

export const initLosState = <T>(
  state: Atom<T>,
  defaultValue: T,
  allowReinitialize?: boolean
): void => {
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

export const useInitLosState = <T>(
  atom: Atom<T>,
  defaultValue: T,
  allowReinitialize?: boolean
): [T, SetLosState<T>] => {
  initLosState(atom, defaultValue, allowReinitialize);

  return [useLosValue(atom), useSetLosState(atom)];
};
