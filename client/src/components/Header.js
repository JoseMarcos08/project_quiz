import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ showUserMenu = true, children }) {
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Verificar se é um usuário logado (com email) ou convidado (sem email mas com token)
    if (token) {
      if (userEmail || user.email) {
        // Usuário logado com email
        if (user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else if (user.isGuest) {
        // Usuário convidado
        navigate('/dashboard');
      } else {
        // Token existe mas não é nem usuário logado nem convidado
        navigate('/');
      }
    } else {
      // Sem token, ir para a página inicial
      navigate('/');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo e texto removidos */}
        <div className="header-right">
          {children}
        </div>
      </div>
    </header>
  );
}

export default Header; 