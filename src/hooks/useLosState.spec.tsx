import * as React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { atom } from '../store';
import { useLosState } from './useLosState';

const atomState = atom({ defaultValue: 1 });
const Wrapper = () => {
  const [state, setState] = useLosState(atomState);

  return (
    <div>
      <span data-testid="state">{state}</span>
      <button data-testid="increment" onClick={() => setState(2)}>
        Increment
      </button>
    </div>
  );
};

describe('useLosState() testing', () => {
  it("should useLosState return state's defaultValue", () => {
    const state = atom({ defaultValue: 1 });
    const { result } = renderHook(() => useLosState(state));

    expect(result.current[0]).toBe(1);
  });

  it('should useLosState return the new state after setState', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('increment'));

    expect(screen.getByTestId('state')).toHaveTextContent('2');
  });
});
