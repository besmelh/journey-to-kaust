import logo from './logo.svg';
import './App.css';
import SampleDataComponent from './Components/SampleDataComponent';
import TestMessageComponent from './Components/TestMessageComponent';
import TestGameComponent from './Components/TestGameComponent';
import MapGraph from './Components/MapGraph';
import MainGame from './Components/MainGame';
function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Journey to Kaust</h1>
        <MainGame />
        {/* <MapGraph /> */}
        <TestGameComponent />
        <TestMessageComponent />
        <SampleDataComponent />
      </header>
    </div>
  );
}

export default App;
