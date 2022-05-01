import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { Atom, atom } from '../store';
import { useLosReducer } from './useLosReducer';
import { useLosValue } from './useLosState';

describe('useLosReducer() testing', () => {
  let atomState: Atom<number, 'INCREMENT'>, Wrapper: React.ElementType;
  beforeEach(() => {
    atomState = atom({
      defaultValue: 1,
      reducer: (state, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return state + 1;
          default:
            return state;
        }
      },
    });
    Wrapper = () => {
      const [state, dispatch] = useLosReducer<number, 'INCREMENT'>(atomState);

      return (
        <div>
          <span data-testid="state">{state}</span>
          <button data-testid="increment" onClick={() => dispatch({ type: 'INCREMENT' })}>
            Increment
          </button>
        </div>
      );
    };
  });

  it("should useLosReducer return state's defaultValue", () => {
    render(<Wrapper />);

    expect(screen.getByTestId('state')).toHaveTextContent('1');
  });

  it('should useLosReducer return the new state after dispatch', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('state')).toHaveTextContent('2');

    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('state')).toHaveTextContent('3');
  });

  it('should any components that use the atom are updated to the latest value', async () => {
    const Wrapper2 = () => {
      const state = useLosValue(atomState);

      return <div data-testid="wrapper2">another component: {state}</div>;
    };
    const Parent = () => (
      <>
        <Wrapper />
        <Wrapper2 />
      </>
    );

    render(<Parent />);

    expect(screen.getByTestId('wrapper2')).toHaveTextContent('another component: 1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('wrapper2')).toHaveTextContent('another component: 2');
  });
});
