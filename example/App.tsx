import { state } from './store';
import { useLosState } from '../src/store';
import Foo from './Foo';
import Boo from './Boo';
import React from 'react';

const App = () => {
  const [myState, setMyState] = useLosState(state);
  const [myState2, setMyState2] = React.useState(0);

  console.log(myState);

  React.useEffect(() => {
    console.log('re-render', myState);
  });

  return (
    <div>
      <div onClick={() => setMyState(4)}>{myState}</div>
      <div onClick={() => setMyState2(5)}>{myState2}</div>
      <Foo />
      <Boo />
    </div>
  );
};

export default App;
