// useReducer
// http://localhost:3000/isolated/exercise/01.extra-4.js

import * as React from 'react';

// What most people do conventionally (mostly thanks to redux). Update your reducer so I can do this:
// The 1st argument is called "state" - the current value of count
// The 2nd argument is called "action" - the value passed to setCount
function countReducer(state, action) {
  const {type, step} = action;
  switch (type) {
    case 'INCREMENT':
      return {...state, count: state.count + step};
    default:
      throw new Error(`Unsupported action type: ${type}`);
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  });
  const {count} = state;
  const increment = () => dispatch({type: 'INCREMENT', step});

  return <button onClick={increment}>{count}</button>;
}

function App() {
  return <Counter />;
}

export default App;
