import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [mostrarAvisoConvidado, setMostrarAvisoConvidado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obter o email do usuário do localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setIsGuest(false);
    } else {
      // Se não houver email salvo, é um acesso como convidado
      setIsGuest(true);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const abrirModalLogout = () => {
    setIsDropdownOpen(false); // Fecha o dropdown
    setMostrarModalLogout(true);
  };

  const fecharModalLogout = () => {
    setMostrarModalLogout(false);
  };

  const confirmarLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleProfile = () => {
    if (isGuest) {
      setMostrarAvisoConvidado(true);
    } else {
      navigate('/profile');
    }
  };

  const handleStartQuiz = () => {
    if (isGuest) {
      setMostrarAvisoConvidado(true);
    } else {
      navigate('/dificuldade');
    }
  };

  const continuarComoConvidado = () => {
    setMostrarAvisoConvidado(false);
    navigate('/dificuldade');
  };

  const irParaLogin = () => {
    navigate('/login');
  };

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-menu')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-menu">
          <button className="user-button" onClick={toggleDropdown}>
            {isGuest ? '?' : userEmail.charAt(0).toUpperCase()}
          </button>
          <div className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}>
            {!isGuest && (
              <a href="#" className="dropdown-item" onClick={handleProfile}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </a>
            )}
            <a href="#" className="dropdown-item" onClick={abrirModalLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </a>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="quiz-buttons">
          <button className="quiz-button" onClick={() => navigate('/ranking')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Ranking
          </button>
          <button className="quiz-button" onClick={() => navigate('/historico')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Histórico
          </button>
          <button className="quiz-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como Jogar
          </button>
          <button className="quiz-button" onClick={handleStartQuiz}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Começar Jogo
          </button>
        </div>
      </main>

      {mostrarModalLogout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {isGuest ? 'Sair do Modo Convidado' : 'Confirmar Logout'}
            </h3>
            <p className="modal-message">
              {isGuest 
                ? 'Você realmente deseja sair do modo convidado?' 
                : 'Você realmente deseja sair da sua conta?'
              }
            </p>
            <div className="modal-buttons">
              <button 
                className="modal-button confirmar"
                onClick={confirmarLogout}
              >
                {isGuest ? 'Sim, sair do modo convidado' : 'Sim, sair'}
              </button>
              <button 
                className="modal-button cancelar"
                onClick={fecharModalLogout}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarAvisoConvidado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Modo Convidado</h3>
            <div className="modal-message">
              <p>Você está jogando como convidado!</p>
              <p>Neste modo, suas pontuações e progresso não serão salvos.</p>
              <p>Para salvar seu progresso e participar do ranking, faça login ou crie uma conta.</p>
            </div>
            <div className="modal-buttons">
              <button 
                className="modal-button verde"
                onClick={irParaLogin}
              >
                Fazer Login
              </button>
              <button 
                className="modal-button vermelho"
                onClick={continuarComoConvidado}
              >
                Continuar como Convidado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 