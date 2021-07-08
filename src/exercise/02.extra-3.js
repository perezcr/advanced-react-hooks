// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.extra-3.js

import * as React from 'react';
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon';

/*
  Consider the scenario where we fetch a pokemon, and before the request finishes, we change our mind and navigate
  to a different page (or uncheck the mount checkbox). In that case, the component would get removed from the page ("unmounted")
  and when the request finally does complete, it will call dispatch, but because the component has been removed from the page,
  we’ll get this warning from React:

  Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
  To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

  The best solution to this problem would be to [cancel the request](https://developers.google.com/web/updates/2017/09/abortable-fetch),
  but even then, we'd have to handle the error and prevent the `dispatch` from being called for the rejected promise.
*/

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false);

  // useLayoutEffect
  // This will ensure that this function is going to be called as soon as we're mounted without waiting for the browser to paint the screen, and it will also ensure that this cleanup is called as soon as we're unmounted without waiting for anything either
  React.useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return React.useCallback(
    (...args) => {
      if (mountedRef.current) {
        dispatch(...args);
      }
    },
    [dispatch],
  );
}

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null};
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null};
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  });

  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = React.useCallback(
    promise => {
      if (!promise) {
        return;
      }
      dispatch({type: 'pending'});
      promise.then(
        data => {
          dispatch({type: 'resolved', data});
        },
        error => {
          dispatch({type: 'rejected', error});
        },
      );
    },
    [dispatch],
  );

  return {...state, run};
}

function PokemonInfo({pokemonName}) {
  const {data, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  });

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    }
    run(fetchPokemon(pokemonName));
  }, [pokemonName, run]);

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon';
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (status === 'rejected') {
    throw error;
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={data} />;
  }

  throw new Error('This should be impossible');
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  );
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  );
}

export default AppWithUnmountCheckbox;
