import * as React from 'react';
import { cancel, resume } from './physics/own';
import './App.css';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        {/* <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p> */}
        <button onClick={cancel}>暂停</button>
        <button onClick={resume}>继续</button>
      </div>
    );
  }
}

export default App;
