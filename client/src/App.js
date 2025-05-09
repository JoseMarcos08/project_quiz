import './styles/global.css';
import AppRoutes from './Routes';
import Admin from './pages/Admin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminUsers from './pages/AdminUsers';
import AdminQuestions from './pages/AdminQuestions';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/questions" 
            element={
              <ProtectedAdminRoute>
                <AdminQuestions />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
