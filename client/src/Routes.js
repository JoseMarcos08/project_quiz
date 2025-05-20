import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import DificuldadeQuiz from './pages/DificuldadeQuiz';
import QuantidadePerguntas from './pages/QuantidadePerguntas';
import HistoricoPartidas from './pages/HistoricoPartidas';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import PlayerProfile from './pages/PlayerProfile';
import TwoFactorAuth from './pages/TwoFactorAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AddQuestion from './pages/AddQuestion';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dificuldade" element={<ProtectedRoute><DificuldadeQuiz /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/quantidade" element={<ProtectedRoute><QuantidadePerguntas /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute><HistoricoPartidas /></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/player/:playerId" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />
      <Route path="/admin/add-question" element={<ProtectedRoute><AddQuestion /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes; 