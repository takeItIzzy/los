import mergeStoreItem from './mergeStoreItem';
import pushSubscribe from './pushSubscribe';
import { Atom, store, StoreItem } from '../store';

const updateStoreItem = <T, A = void>(state: Atom<T, A>, newItem: Partial<StoreItem>) => {
  const { value } = newItem;

  if (!Object.is(value, store.get(state)!.value)) {
    mergeStoreItem(state, newItem);
    pushSubscribe(state);
  }
};

export default updateStoreItem;
