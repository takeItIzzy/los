import { Atom, store } from '../store';
import { SetLosState, useLosValue, useSetLosState } from './useLosState';
import mergeStoreItem from '../utils/mergeStoreItem';
import pushSubscribe from '../utils/pushSubscribe';

export const initLosState = <T, A = void>(
  state: Atom<T, A>,
  defaultValue: T,
  allowReinitialize?: boolean
): void => {
  if (allowReinitialize) {
    mergeStoreItem(state, { hasInit: true, value: defaultValue, stateBucket: new Map() });
    pushSubscribe(state);
  } else if (!store.get(state)!.hasInit) {
    mergeStoreItem(state, {
      hasInit: true,
      value: defaultValue,
      stateBucket: store.get(state)!.stateBucket ?? new Map(),
    });
    pushSubscribe(state);
  }
};

export const useInitLosState = <T, A = void>(
  atom: Atom<T, A>,
  defaultValue: T,
  allowReinitialize?: boolean
): [T, SetLosState<T>] => {
  initLosState(atom, defaultValue, allowReinitialize);

  return [useLosValue(atom), useSetLosState(atom)];
};