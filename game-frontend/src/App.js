import logo from './logo.svg';
import './App.css';
import SampleDataComponent from './Components/SampleDataComponent';
import TestMessageComponent from './Components/TestMessageComponent';
import TestGameComponent from './Components/TestGameComponent';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Shortest Path Game</h1>
        <TestGameComponent />
        <TestMessageComponent />
        <SampleDataComponent />
      </header>
    </div>
  );
}

export default App;
