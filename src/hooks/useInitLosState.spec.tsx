import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { atom } from '../store';
import { useLosValue } from './useLosState';
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

    await screen.findByText('1');

    await screen.findByText('2');
  });
});
