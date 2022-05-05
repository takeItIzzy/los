import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { atom, computed } from '../store';
import { useLosState, useLosValue } from './useLosState';
import { initLosState } from './useInitLosState';

describe('initLosState() testing', () => {
  it('should initialize the state successfully', async () => {
    const atomState = atom<number>();
    const Wrapper = () => {
      const state = useLosValue(atomState);

      React.useEffect(() => {
        setTimeout(() => {
          initLosState(atomState, 1);
        }, 1000);
      }, []);

      return <div>{state ?? 'loading'}</div>;
    };

    render(<Wrapper />);

    screen.getByText('loading');

    await screen.findByText('1');
  });

  it('should not reinitialize the state by default', async () => {
    const atomState = atom<number>();
    const Wrapper = () => {
      const state = useLosValue(atomState);

      React.useEffect(() => {
        setTimeout(() => {
          initLosState(atomState, 1);
        }, 1000);

        setTimeout(() => {
          initLosState(atomState, 2);
        }, 2000);
      }, []);

      return <div>{state ?? 'loading'}</div>;
    };

    render(<Wrapper />);

    await screen.findByText('1');

    await expect(screen.findByText('2')).rejects.toThrow();
  });

  it('should reinitialize the state when the third argument has been set', async () => {
    const atomState = atom<number>();
    const Wrapper = () => {
      const state = useLosValue(atomState);

      React.useEffect(() => {
        setTimeout(() => {
          initLosState(atomState, 1);
        }, 1000);

        setTimeout(() => {
          initLosState(atomState, 2, true);
        }, 2000);
      }, []);

      return <div>{state ?? 'loading'}</div>;
    };

    render(<Wrapper />);

    await screen.findByText('loading');

    await screen.findByText('1');

    await screen.findByText('2');
  });
});

describe('computed testing', () => {
  it('readonly computed', async () => {
    const atomState = atom<number>();
    const computedState = computed({
      get: ({ get }) => {
        return (get(atomState) ?? 0) + 10;
      },
    });
    const Wrapper = () => {
      const state = useLosValue(computedState);

      React.useEffect(() => {
        setTimeout(() => {
          initLosState(atomState, 1);
        }, 1000);
      }, []);

      return <div>{state}</div>;
    };

    render(<Wrapper />);

    await screen.findByText('10');

    await screen.findByText('11');
  });

  it('writable computed', async () => {
    const atomState = atom<number>();
    const computedState = computed({
      get: ({ get }) => {
        return (get(atomState) ?? 0) + 10;
      },
      set: ({ set }, value) => {
        set(atomState, value - 5);
      },
    });
    const Wrapper = () => {
      const [state, setState] = useLosState(computedState);

      React.useEffect(() => {
        setTimeout(() => {
          initLosState(atomState, 1);
        }, 1000);
      }, []);

      return (
        <>
          <div>{state}</div>
          <button data-testid="button" onClick={() => setState(7)}>
            Click
          </button>
        </>
      );
    };

    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(screen.getByTestId('button'));

    // atomItem is 2 now, and computed is atom + 10
    await screen.findByText('12');
  });
});
