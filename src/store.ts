import createSubscribe, { StateBucket, Subscribe } from './utils/createSubscribe';
import { __DEV__ } from './constants';
import { error } from './utils/warn';
import updateStoreItem from './utils/updateStoreItem';

/**
 * Collecting state to store when useLosState or init/useLosInit is executing.
 * useLosValue triggers component re-rendering when state updated.
 */

export interface StoreItem {
  hasInit: boolean;
  value: any;
  reducer?: LosReducer<any, any>;
  cached?: boolean;
  stateBucket: StateBucket;
  subscribe: Subscribe;
}
export const store: Map<Atom<any, any>, StoreItem> = new Map();

export type LosAction<T> = { type: T; [key: string]: any };
export type LosReducer<S, A> = (state: S, action: LosAction<A>) => S;
export class Atom<T, A = void> {
  constructor(value?: T, reducer?: LosReducer<T, A>, cached?: boolean) {
    this.value = value;
    this.reducer = reducer;
    this.cached = cached;
  }
  readonly value?: T;
  readonly reducer?: LosReducer<T, A>;
  readonly cached?: boolean;
}

export const atom = <T, A = void>(
  config: {
    defaultValue?: T;
    reducer?: LosReducer<T, A>;
    cached?: boolean;
  } = {}
): Atom<T, A> => {
  const { defaultValue, reducer, cached = true } = config;
  const atomItem = new Atom(defaultValue, reducer, cached);

  const stateBucket: StateBucket = new Set();
  store.set(atomItem, {
    hasInit: false,
    value: atomItem.value,
    reducer: atomItem.reducer,
    cached,
    stateBucket,
    subscribe: createSubscribe(stateBucket, atomItem),
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
  readonly getter: (config: ComputedGetMethods) => Derive;
  readonly setter?: (config: ComputedSetMethods, newValue: Derive) => void;
  readonly originAtoms: Set<Atom<any, any>>;
  stateProvider<T, A>(atom: Atom<T, A>): T {
    this.originAtoms.add(atom);
    return store.get(atom)!.value;
  }
  get value() {
    return this.getter({ get: this.stateProvider });
  }
  set value(newValue: Derive) {
    this.setter?.(
      {
        get: this.stateProvider,
        set: (atom, value) => {
          updateStoreItem(atom, {
            // now that we start updating state, we can confirm that the atom has been initialized
            hasInit: true,
            value,
          });
        },
      },
      newValue
    );
  }
}

type ComputedConfig<Derive> = {
  get: (methods: ComputedGetMethods) => Derive;
  set?: <NewValue extends Derive>(methods: ComputedSetMethods, value: NewValue) => void;
};
export const computed = <Derive>(config: ComputedConfig<Derive>): Computed<Derive> => {
  const { get, set } = config;

  if (__DEV__ && !get) {
    error('computed: a Computed must have a get method.');
  }

  return new Computed(get, set);
};
