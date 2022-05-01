import { atom, LosReducer, store } from './store';

describe('atom() testing', () => {
  it('should exist current key in store when defaultValue is provided', () => {
    const state = atom({
      defaultValue: 'default',
    });
    expect(store.has(state)).toBeTruthy();
    expect(store.get(state)).toMatchSnapshot(`{
      hasInit: false,
      value: 'default',
      reducer: undefined,
      stateBucket: new Set(),
      subscribe: [Function]
    }`);
  });

  it('should exist current key in store when reducer is provided', () => {
    const reducer: LosReducer<any, any> = (state) => {
      return state;
    };
    const state = atom({
      reducer,
    });
    expect(store.has(state)).toBeTruthy();
    expect(store.get(state)).toMatchSnapshot(`{
      hasInit: false,
      value: undefined,
      reducer,
      stateBucket: new Set(),
      subscribe: [Function]
    }`);
  });

  it('should exist current key in store when defaultValue and reducer are both provided', () => {
    const reducer: LosReducer<any, any> = (state) => {
      return state;
    };
    const state = atom({
      defaultValue: 'default',
      reducer,
    });
    expect(store.has(state)).toBeTruthy();
    expect(store.get(state)).toMatchSnapshot(`{
      hasInit: false,
      value: 'default',
      reducer,
      stateBucket: new Set(),
      subscribe: [Function]
    }`);
  });

  it('should exist current key in store when defaultValue and reducer are neither provided', () => {
    const state = atom();
    expect(store.has(state)).toBeTruthy();
    expect(store.get(state)).toMatchSnapshot(`{
      hasInit: false,
      value: undefined,
      reducer: undefined,
      stateBucket: new Set(),
      subscribe: [Function]
    }`);
  });
});
