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
});
