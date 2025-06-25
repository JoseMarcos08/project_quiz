import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import ConfirmModal from '../components/ConfirmModal';

function Home() {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, message: '' });

  const entrarComoConvidado = async () => {
    try {
      const response = await fetch('http://localhost:3001/guest-login', { method: 'POST' });
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('userEmail'); // Garante que não há email de usuário
      navigate('/dashboard');
    } catch (error) {
      setModal({ open: true, message: 'Erro ao entrar como convidado. Tente novamente.' });
    }
  };

  return (
    <div className="home-container">
      <div className="home-logo-block">
        <div className="home-logo-circle">
          <img src="/desenvolveai-logo.png" alt="DesenvolveAí Logo" className="home-logo-img" onError={e => { e.target.src = "/logo192.png"; }} />
        </div>
        <h1 className="home-title">DesenvolveAí</h1>
      </div>
      <div className="home-content">
        <div className="button-container">
          <Link to="/login" className="button">
            CONECTE-SE
          </Link>
          <Link to="/register" className="button">
            CADASTRO
          </Link>
          <button className="button guest-button" onClick={entrarComoConvidado}>
            <span className="guest-icon">?</span>
            ENTRAR COMO CONVIDADO
          </button>
        </div>
      </div>
      <ConfirmModal
        open={modal.open}
        title="Erro"
        message={modal.message}
        onConfirm={() => setModal({ open: false, message: '' })}
        onlyConfirm
        confirmText="Fechar"
      />
    </div>
  );
}

export default Home; 