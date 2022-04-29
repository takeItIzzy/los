import { Atom, store } from '../store';

const pushSubscribe = <T, A = void>(state: Atom<T, A>) => {
  store.get(state)!.stateBucket!.forEach((fn) => fn());
};

export default pushSubscribe;
