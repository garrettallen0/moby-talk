import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { MapDetail } from './components/MapDetail';
import { MapEditor } from './components/MapEditor';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map">
              <Route index element={<MapDetail />} />
              <Route path="new" element={<MapEditor />} />
              <Route path=":id/edit" element={<MapEditor />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
