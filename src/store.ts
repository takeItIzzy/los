import createSubscribe, { StateBucket, Subscribe } from './utils/createSubscribe';

/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosValue triggers component re-rendering when state updated.
 */

export interface StoreItem {
  hasInit: boolean;
  value: any;
  reducer?: LosReducer<any, any>;
  stateBucket: StateBucket;
  subscribe: Subscribe;
}
export const store: Map<Atom<any, any>, StoreItem> = new Map();

export type LosAction<T> = { type: T; [key: string]: any };
export type LosReducer<S, A> = (state: S, action: LosAction<A>) => S;
export class Atom<T, A = void> {
  constructor(value?: T, reducer?: LosReducer<T, A>) {
    this.value = value;
    this.reducer = reducer;
  }
  value?: T;
  reducer?: LosReducer<T, A>;
}

export const atom = <T, A = void>(
  config: {
    defaultValue?: T;
    reducer?: LosReducer<T, A>;
  } = {}
): Atom<T, A> => {
  const { defaultValue, reducer } = config;
  const atomItem = new Atom(defaultValue, reducer);

  const stateBucket: StateBucket = new Set();
  store.set(atomItem, {
    hasInit: false,
    value: atomItem.value,
    reducer: atomItem.reducer,
    stateBucket,
    subscribe: createSubscribe(stateBucket),
  });

  return atomItem;
};
