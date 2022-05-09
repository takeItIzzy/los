import { atom, computed, LosReducer } from '../src';

type ActionType = 'INCREMENT' | 'DECREMENT';
const reducer: LosReducer<number, ActionType> = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
};
export const state = atom({
  defaultValue: 0,
  reducer,
});

export const computedState = computed({
  get: ({ get }) => {
    return get(state) + 1;
  },
  set: ({ set }, newValue) => {
    set(state, newValue - 1);
  },
});

export const uncachedState = atom({ defaultValue: 0, cached: false });
export const cachedState = atom({ defaultValue: 0 });
