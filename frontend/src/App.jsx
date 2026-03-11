import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import { LogOut, MapPin } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#F9C935] flex items-center justify-center p-1.5 skeleton">
              <MapPin className="text-black w-full h-full" />
            </div>
            <span className="text-xl font-black tracking-tighter text-black uppercase">Traffixx<span className="text-[#F9C935]">.</span></span>
          </div>

          {token && (
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold leading-none text-black bg-[#F9C935] rounded-full uppercase tracking-widest shadow-sm">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-black font-semibold transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
        <Navbar />

        <main className="flex-1 relative mt-16 w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
          <Routes>
            <Route path="/register" element={<div className="container mx-auto px-4 py-8 h-full overflow-y-auto"><Register /></div>} />
            <Route path="/login" element={<div className="container mx-auto px-4 py-8 h-full overflow-y-auto"><Login /></div>} />

            <Route path="/rider" element={<RiderDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
