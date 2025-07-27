import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { MapDetail } from './components/MapDetail';
import { MapEditor } from './components/MapEditor';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large subtle circles for atmosphere */}
          <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-indigo-400/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-sky-400/6 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <Navbar />
        <main className="flex-1 mx-auto px-4 py-8 w-full max-w-7xl box-border relative z-10">
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
