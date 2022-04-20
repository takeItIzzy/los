import { state } from './store';
import { useSetLosState } from '../src/store';
import Foo from './Foo';

const App = () => {
  const setMyState = useSetLosState(state);
  return (
    <div className="App" onClick={() => setMyState(3)}>
      <Foo />
    </div>
  )
};

export default App;
