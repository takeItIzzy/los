import { Atom, store } from '../store';
import mergeStoreItem from './mergeStoreItem';

export type StateBucket = Set<() => void>;
export type Subscribe = (subscribeFn: () => void) => () => void;
const createSubscribe: (stateBucket: StateBucket, atomItem: Atom<any, any>) => Subscribe =
  (stateBucket, atomItem) => (fn) => {
    stateBucket.add(fn);

    return () => {
      stateBucket.delete(fn);

      // if there are no more subscribers and the atom is not persistent, reset the atom to its initial value
      if (stateBucket.size === 0 && !store.get(atomItem)!.cached) {
        mergeStoreItem(atomItem, {
          hasInit: false,
          value: atomItem.value,
        });
      }
    };
  };

export default createSubscribe;
