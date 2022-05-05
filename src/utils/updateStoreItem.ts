import mergeStoreItem from './mergeStoreItem';
import pushSubscribe from './pushSubscribe';
import { Atom, StoreItem } from '../store';

const updateStoreItem = <T, A = void>(state: Atom<T, A>, newItem: Partial<StoreItem>) => {
  mergeStoreItem(state, newItem);
  pushSubscribe(state);
};

export default updateStoreItem;
