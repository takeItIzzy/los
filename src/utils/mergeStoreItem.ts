import { Atom, store, StoreItem } from '../store';

const mergeStoreItem = <T, A = void>(state: Atom<T, A>, newItem: Partial<StoreItem>): void => {
  store.set(state, {
    ...(store.has(state) && store.get(state)),
    ...newItem,
  } as StoreItem);
};

export default mergeStoreItem;
