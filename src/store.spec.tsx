import { atom, LosReducer, store } from './store';
import { useLosState } from './hooks/useLosState';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';

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
      cached: true,
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
      reducer: [Function],
      cached: true,
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
      reducer: [Function],
      cached: true,
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
      cached: true,
      stateBucket: new Set(),
      subscribe: [Function]
    }`);
  });

  it('if there are no more subscribers and the atom is not persistent, reset the atom to its initial value', async () => {
    const uncachedState = atom({ defaultValue: 0, cached: false });
    const Foo = () => {
      const [state, setState] = useLosState(uncachedState);

      return (
        <>
          <div data-testid="showState">uncached: {state}</div>
          <button data-testid="setStateButton" onClick={() => setState(3)}>
            click me
          </button>
        </>
      );
    };
    const Boo = () => {
      const [state, setState] = useLosState(uncachedState);

      return (
        <>
          <div data-testid="showState2">uncached2: {state}</div>
          <button data-testid="setStateButton2" onClick={() => setState(3)}>
            click me
          </button>
        </>
      );
    };
    const Wrapper = () => {
      const [showFoo, setShowFoo] = React.useState(true);
      const [showBoo, setShowBoo] = React.useState(true);

      return (
        <>
          <button data-testid="showFooButton" onClick={() => setShowFoo((prev) => !prev)}>
            click me
          </button>
          <button data-testid="showBooButton" onClick={() => setShowBoo((prev) => !prev)}>
            click me
          </button>
          {showFoo && <Foo />}
          {showBoo && <Boo />}
        </>
      );
    };

    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('setStateButton'));
    await user.click(screen.getByTestId('setStateButton2'));

    expect(screen.getByTestId('showState')).toHaveTextContent('uncached: 3');
    expect(screen.getByTestId('showState2')).toHaveTextContent('uncached2: 3');

    await user.click(screen.getByTestId('showFooButton')); // hide Foo
    await user.click(screen.getByTestId('showFooButton')); // show Foo

    // atom won't be reset because there are still subscribers
    expect(screen.getByTestId('showState')).toHaveTextContent('uncached: 3');

    await user.click(screen.getByTestId('showFooButton')); // hide Foo
    await user.click(screen.getByTestId('showBooButton')); // hide Boo
    await user.click(screen.getByTestId('showFooButton')); // show Foo
    await user.click(screen.getByTestId('showBooButton')); // show Boo

    // atom will be reset because all subscribers used to be removed
    expect(screen.getByTestId('showState')).toHaveTextContent('uncached: 0');
    expect(screen.getByTestId('showState2')).toHaveTextContent('uncached2: 0');
  });
});
