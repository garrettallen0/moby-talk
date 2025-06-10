import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthButton } from './components/AuthButton';
import { Home } from './components/Home';
import { MapDetail } from './components/MapDetail';

function App() {
  return (
    <Router>
      <div className="container">
        <AuthButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
