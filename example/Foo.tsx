import * as React from 'react';
import { useLosValue } from '../src/store';
import { state } from './store';

const Foo = () => {
  const myState = useLosValue(state);

  return (
    <div>
      {myState}
    </div>
  )
};

export default Foo;