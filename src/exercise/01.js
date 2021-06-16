/** @format */

// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react';

// The 1st argument is called "state" - the current value of count
// The 2nd argument is called "action" - the value passed to setCount
function countReducer(state, newState) {
  return state + newState;
}

function Counter({initialCount = 0, step = 2}) {
  const [count, changeCount] = React.useReducer(countReducer, initialCount);
  const increment = () => changeCount(step);

  return <button onClick={increment}>{count}</button>;
}

function App() {
  return <Counter />;
}

export default App;
