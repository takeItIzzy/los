export type StateBucket = Set<() => void>;
export type Subscribe = (subscribeFn: () => void) => () => void;
const createSubscribe: (stateBucket: StateBucket) => Subscribe = (stateBucket) => (fn) => {
  stateBucket.add(fn);

  return () => {
    stateBucket.delete(fn);
  };
};

export default createSubscribe;
