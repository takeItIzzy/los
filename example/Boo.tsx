import * as React from 'react';
import { initLosState } from '../src/store';
import { state } from './store';

const Boo = () => {
  React.useEffect(() => {
    setTimeout(() => {
      initLosState(state, 123111);
    }, 2000);
  }, []);

  return <div>Boo</div>;
};

export default Boo;
