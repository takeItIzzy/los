import { computedState, state } from './store';
import { useLosReducer, useLosState } from '../src';
import Foo from './Foo';
import Boo from './Boo';
import * as React from 'react';

const App = () => {
  const [myState, dispatch] = useLosReducer(state);
  const [com, setCom] = useLosState(computedState);
  const [showFoo, setShowFoo] = React.useState(true);

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
      <button onClick={() => setShowFoo((prev) => !prev)}>toggle Foo</button>
      {showFoo && <Foo />}
      <Boo />
    </div>
  );
};

export default App;
