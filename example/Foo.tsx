import * as React from 'react';
import { useSetLosState } from '../src';
import { state } from './store';

const Foo = () => {
  const setState = useSetLosState(state);

  return (
    <div
      onClick={() => {
        setState(3);
      }}
    >
      child
    </div>
  );
};

export default Foo;
