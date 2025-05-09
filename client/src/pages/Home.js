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
      <h1>Bem-vindo!</h1>
      <div className="button-container">
        <Link to="/login" className="button">
          Login
        </Link>
        <Link to="/register" className="button">
          Cadastro
        </Link>
        <button className="button guest-button" onClick={entrarComoConvidado}>
          <span className="guest-icon">?</span>
          Entrar como convidado
        </button>
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