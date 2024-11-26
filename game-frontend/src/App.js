import logo from './logo.svg';
import './App.css';
import SampleDataComponent from './Components/SampleDataComponent';
import TestMessageComponent from './Components/TestMessageComponent';
import TestGameComponent from './Components/TestGameComponent';
import MapGraph from './Components/MapGraph';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Shortest Path Game</h1>
        <MapGraph />
        <TestGameComponent />
        <TestMessageComponent />
        <SampleDataComponent />
      </header>
    </div>
  );
}

export default App;
