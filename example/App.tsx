import { computedState, state } from './store';
import { useLosReducer, useLosState } from '../src';
import Foo from './Foo';
import Boo from './Boo';
import * as React from 'react';

const App = () => {
  const [myState, dispatch] = useLosReducer(state);
  const [com, setCom] = useLosState(computedState);
  const [myState2, setMyState2] = React.useState(0);

  React.useEffect(() => {
    console.log('re-render', myState);
  });

  return (
    <div>
      <div>
        <span>computed: </span>
        <span onClick={() => setCom(100)}>{com}</span>
      </div>
      <div onClick={() => dispatch({ type: 'INCREMENT' })}>{myState}</div>
      <div onClick={() => setMyState2(5)}>{myState2}</div>
      <Foo />
      <Boo />
    </div>
  );
};

export default App;
