/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosValue triggers component re-rendering when state updated.
 */

export interface StoreItem {
  hasInit: boolean;
  value: any;
  reducer?: LosReducer<any, any>;
  stateBucket?: Map<symbol, () => void>;
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

export const atom = <T, A = void>({
  defaultValue,
  reducer,
}: {
  defaultValue?: T;
  reducer?: LosReducer<T, A>;
}): Atom<T, A> => {
  const atomItem = new Atom(defaultValue, reducer);

  store.set(atomItem, {
    hasInit: false,
    value: atomItem.value,
    reducer: atomItem.reducer,
    stateBucket: new Map(),
  });

  return atomItem;
};
