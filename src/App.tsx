import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Partners } from './pages/Partners';
import { GatedKit } from './pages/GatedKit';
import { Admin } from './pages/Admin';
import { AuthModal } from './components/AuthModal';

export default function App() {
  return (
    <Router>
      <AuthModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/kit/:token" element={<GatedKit />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
