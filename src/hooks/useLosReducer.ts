import { Atom, LosAction, store } from '../store';
import { useLosValue } from './useLosState';
import { initLosState } from './useInitLosState';
import updateStoreItem from '../utils/updateStoreItem';

type LosDispatch<A> = (action: LosAction<A>) => void;

export const losDispatch = <T, A = void>(state: Atom<T, A>): LosDispatch<A> => {
  if (!(state instanceof Atom)) {
    throw new Error('losDispatch: state must be an Atom');
  }
  return (action) => {
    const currentState = store.get(state);
    updateStoreItem(state, {
      // now that we start updating state, we can confirm that the atom has been initialized
      hasInit: true,
      value: currentState!.reducer!(currentState!.value, action),
    });
  };
};

export const useLosDispatch = losDispatch;

export const useLosReducer = <T, A = void>(
  state: Atom<T, A>,
  initStateValue?: T,
  allowReinitialize?: boolean
): [T, LosDispatch<A>] => {
  !!initStateValue && initLosState(state, initStateValue, allowReinitialize);

  return [useLosValue(state), useLosDispatch(state)];
};
