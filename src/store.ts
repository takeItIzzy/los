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

interface ComputedGetMethods {
  get: <T, A>(atom: Atom<T, A>) => T;
}
interface ComputedSetMethods extends ComputedGetMethods {
  set: <T, A>(atom: Atom<T, A>, value: T) => void;
}
export class Computed<Derive> {
  constructor(
    getter: ({ get }: ComputedGetMethods) => Derive,
    setter?: (config: ComputedSetMethods, newValue: Derive) => void
  ) {
    this.getter = getter;
    this.setter = setter;
    this.originAtoms = new Set<Atom<any, any>>();
    this.stateProvider = this.stateProvider.bind(this);
  }
  getter: (config: ComputedGetMethods) => Derive;
  setter?: (config: ComputedSetMethods, newValue: Derive) => void;
  originAtoms: Set<Atom<any, any>>;
  stateProvider<T, A>(atom: Atom<T, A>): T {
    this.originAtoms.add(atom);
    return store.get(atom)!.value;
  }
  get value() {
    return this.getter({ get: this.stateProvider });
  }
}

type ComputedConfig<Derive> = {
  get: (methods: ComputedGetMethods) => Derive;
  set?: <NewValue extends Derive>(methods: ComputedSetMethods, value: NewValue) => void;
};
export const computed = <Derive>(config: ComputedConfig<Derive>): Computed<Derive> => {
  const { get, set } = config;

  return new Computed(get, set);
};
