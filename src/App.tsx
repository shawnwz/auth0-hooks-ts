import React from 'react';
import './App.css';
import { useAuth0 } from './contexts/auth0-context';

const App: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  console.log(useAuth0)
  return (
    <main>
      {
        !isAuthenticated ?
        <button onClick={loginWithRedirect}>login</button> : <button onClick={()=>logout()}>logout</button>
        //!isAuthenticated ? <button>login</button> : <button>logout</button>
      }
    </main>
  );
}

export default App;
