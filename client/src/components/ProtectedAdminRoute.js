import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedAdminRoute; 