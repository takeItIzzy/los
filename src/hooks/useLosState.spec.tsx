import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { Atom, atom } from '../store';
import { useLosState, useLosValue } from './useLosState';

describe('useLosState() testing', () => {
  let atomState: Atom<number>, Wrapper: React.ElementType;
  beforeEach(() => {
    atomState = atom({ defaultValue: 1 });
    Wrapper = () => {
      const [state, setState] = useLosState<number>(atomState);

      return (
        <div>
          <span data-testid="state">{state}</span>
          <button data-testid="increment" onClick={() => setState(2)}>
            Increment
          </button>
        </div>
      );
    };
  });

  it("should useLosState return state's defaultValue", () => {
    render(<Wrapper />);

    expect(screen.getByTestId('state')).toHaveTextContent('1');
  });

  it('should useLosState return the new state after setState', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('state')).toHaveTextContent('2');
  });

  it('the argument of setState is a callback function', async () => {
    const atomState = atom({ defaultValue: 1 });
    const Wrapper = () => {
      const [state, setState] = useLosState(atomState);

      return (
        <div>
          <span data-testid="state">{state}</span>
          <button data-testid="increment" onClick={() => setState((prev) => prev + 3)}>
            Increment
          </button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('state')).toHaveTextContent('4');
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
