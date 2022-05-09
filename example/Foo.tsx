import * as React from 'react';
import { useLosState } from '../src';
import { uncachedState, cachedState } from './store';

const Foo = () => {
  const [state, setState] = useLosState(uncachedState);
  const [state2, setState2] = useLosState(cachedState);

  return (
    <>
      <div
        onClick={() => {
          setState(3);
        }}
      >
        uncached: {state}
      </div>
      <div
        onClick={() => {
          setState2(3);
        }}
      >
        cached: {state2}
      </div>
    </>
  );
};

export default Foo;
