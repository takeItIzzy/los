import { Atom, LosAction, store } from '../store';
import { useLosValue } from './useLosState';
import mergeStoreItem from '../utils/mergeStoreItem';
import pushSubscribe from '../utils/pushSubscribe';
import { initLosState } from './useInitLosState';

type LosDispatch<A> = (action: LosAction<A>) => void;

export const losDispatch = <T, A = void>(state: Atom<T, A>): LosDispatch<A> => {
  return (action) => {
    const currentState = store.get(state);
    mergeStoreItem(state, {
      // now that we start updating state, we can confirm that the atom has been initialized
      hasInit: true,
      value: currentState!.reducer!(currentState!.value, action),
    });
    pushSubscribe(state);
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
