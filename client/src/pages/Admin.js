import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);

  const handleOptionClick = (option) => {
    if (option === 'users') {
      navigate('/admin/users');
    } else if (option === 'questions') {
      navigate('/admin/questions');
    } else if (option === 'add-questions') {
      navigate('/admin/add-question');
    } else {
      // Futuras opções
      console.log(`Selected option: ${option}`);
    }
  };

  const abrirModalLogout = () => {
    setMostrarModalLogout(true);
  };

  const fecharModalLogout = () => {
    setMostrarModalLogout(false);
  };

  const confirmarLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Painel Administrativo</h1>
        <button className="logout-button" onClick={abrirModalLogout}>
          Sair
        </button>
      </header>

      <div className="admin-options">
        <button 
          className="admin-option"
          onClick={() => handleOptionClick('users')}
        >
          <div className="option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2>Usuários</h2>
          <p>Gerenciar usuários do sistema</p>
        </button>

        <button 
          className="admin-option"
          onClick={() => handleOptionClick('questions')}
        >
          <div className="option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2>Perguntas</h2>
          <p>Visualizar e gerenciar perguntas</p>
        </button>

        <button 
          className="admin-option"
          onClick={() => handleOptionClick('add-questions')}
        >
          <div className="option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2>Adicionar Perguntas</h2>
          <p>Criar novas perguntas para o quiz</p>
        </button>
      </div>

      {mostrarModalLogout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Saída</h2>
            <p>Tem certeza que deseja sair?</p>
            <div className="modal-buttons">
              <button onClick={fecharModalLogout}>Cancelar</button>
              <button onClick={confirmarLogout} className="confirm-button">Sair</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin; 