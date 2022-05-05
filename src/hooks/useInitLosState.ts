import { Atom, Computed, store } from '../store';
import { SetLosState, useLosValue, useSetLosState } from './useLosState';
import updateStoreItem from '../utils/updateStoreItem';

export const initLosState = <T, A = void>(
  state: Atom<T, A> | Computed<T>,
  defaultValue: T,
  allowReinitialize?: boolean
): void => {
  if (!(state instanceof Atom) && !(state instanceof Computed)) {
    throw new Error('initLosState: state must be an Atom or a Computed');
  }

  if (state instanceof Atom) {
    if (allowReinitialize || !store.get(state)!.hasInit) {
      updateStoreItem(state, {
        hasInit: true,
        value: defaultValue,
      });
    }
  } else {
    const { setter, stateProvider } = state;
    if (allowReinitialize || !store.get(state)!.hasInit) {
      setter?.(
        {
          get: stateProvider,
          set: (atom, value) => {
            updateStoreItem(atom, {
              hasInit: true,
              value,
            });
          },
        },
        defaultValue
      );
    }
  }
};

export const useInitLosState = <T, A = void>(
  atom: Atom<T, A> | Computed<T>,
  defaultValue: T,
  allowReinitialize?: boolean
): [T, SetLosState<T>] => {
  initLosState(atom, defaultValue, allowReinitialize);

  return [useLosValue(atom), useSetLosState(atom)];
};
