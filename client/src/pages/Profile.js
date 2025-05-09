import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPartidas: 0,
    pontuacaoMedia: 0,
    melhorPontuacao: 0,
    pontuacaoGeral: 0,
    rankings: {
      geral: 'Não classificado',
      facil: 'Não classificado',
      medio: 'Não classificado',
      dificil: 'Não classificado',
      aleatorio: 'Não classificado'
    },
    partidasPorDificuldade: {
      facil: 0,
      medio: 0,
      dificil: 0,
      aleatorio: 0
    }
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          navigate('/login');
          return;
        }

        // Buscar ID do usuário
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/usuarios/buscar?email=${email}`);
        if (!userResponse.ok) {
          throw new Error('Erro ao buscar usuário');
        }
        const userData = await userResponse.json();
        
        if (!userData.id) {
          navigate('/login');
          return;
        }

        // Buscar partidas do usuário
        const partidasResponse = await fetch(`${process.env.REACT_APP_API_URL}/partidas/${userData.id}`);
        if (!partidasResponse.ok) {
          throw new Error('Erro ao buscar partidas');
        }
        const partidas = await partidasResponse.json();

        // Buscar rankings para diferentes dificuldades
        const rankings = {
          geral: 'Não classificado',
          facil: 'Não classificado',
          medio: 'Não classificado',
          dificil: 'Não classificado',
          aleatorio: 'Não classificado'
        };

        // Buscar ranking geral
        const rankingGeralResponse = await fetch(`${process.env.REACT_APP_API_URL}/ranking?tipo=geral`);
        if (rankingGeralResponse.ok) {
          const rankingGeral = await rankingGeralResponse.json();
          const posicaoGeral = rankingGeral.findIndex(r => r.id_usuario === userData.id) + 1;
          rankings.geral = posicaoGeral > 0 ? posicaoGeral : 'Não classificado';
        }

        // Buscar rankings por dificuldade
        const dificuldades = ['facil', 'medio', 'dificil', 'aleatorio'];
        for (const dificuldade of dificuldades) {
          const rankingResponse = await fetch(`${process.env.REACT_APP_API_URL}/ranking?tipo=geral&dificuldade=${dificuldade}`);
          if (rankingResponse.ok) {
            const ranking = await rankingResponse.json();
            const posicao = ranking.findIndex(r => r.id_usuario === userData.id) + 1;
            rankings[dificuldade] = posicao > 0 ? posicao : 'Não classificado';
          }
        }

        // Calcular estatísticas
        const totalPartidas = partidas.length;
        const pontuacaoMedia = totalPartidas > 0 
          ? partidas.reduce((sum, p) => sum + p.pontuacao, 0) / totalPartidas 
          : 0;
        const melhorPontuacao = totalPartidas > 0 
          ? Math.max(...partidas.map(p => p.pontuacao)) 
          : 0;
        const pontuacaoGeral = totalPartidas > 0
          ? partidas.reduce((sum, p) => sum + p.pontuacao, 0)
          : 0;
        
        // Contar partidas por dificuldade
        const partidasPorDificuldade = {
          facil: partidas.filter(p => p.dificuldade === 'facil').length,
          medio: partidas.filter(p => p.dificuldade === 'medio').length,
          dificil: partidas.filter(p => p.dificuldade === 'dificil').length,
          aleatorio: partidas.filter(p => p.dificuldade === 'aleatorio').length
        };

        setUser({
          id: userData.id,
          email: email
        });

        setStats({
          totalPartidas,
          pontuacaoMedia: Math.round(pontuacaoMedia * 10) / 10,
          melhorPontuacao,
          pontuacaoGeral,
          rankings,
          partidasPorDificuldade
        });

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil' });
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial (!@#$%^&*)");
    }
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Resetar mensagens de erro
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });

    // Validar senha atual
    if (!passwordForm.currentPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        currentPassword: 'A senha atual é obrigatória'
      }));
      return;
    }

    // Validar nova senha
    const passwordValidationErrors = validatePassword(passwordForm.newPassword);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(prev => ({
        ...prev,
        newPassword: passwordValidationErrors.join('. ')
      }));
      return;
    }

    // Validar confirmação de senha
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        confirmPassword: 'As senhas não coincidem'
      }));
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-email': user?.email
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        if (data.message === "Senha atual incorreta") {
          setPasswordErrors(prev => ({
            ...prev,
            currentPassword: 'Senha atual incorreta'
          }));
        } else {
          setMessage({ type: 'error', text: data.message || 'Erro ao alterar senha' });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar senha' });
    }
  };

  if (loading) {
    return <div className="profile-container"><div className="loading">Carregando...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Perfil do Jogador</h1>
        <button className="back-button" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Informações do Usuário</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?.id}</p>
          </div>

          <h2>Estatísticas de Jogo</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total de Partidas</h3>
              <p>{stats.totalPartidas}</p>
            </div>
            <div className="stat-item">
              <h3>Pontuação Média</h3>
              <p>{stats.pontuacaoMedia}</p>
            </div>
            <div className="stat-item">
              <h3>Melhor Pontuação</h3>
              <p>{stats.melhorPontuacao}</p>
            </div>
            <div className="stat-item">
              <h3>Pontuação Geral</h3>
              <p>{stats.pontuacaoGeral}</p>
            </div>
          </div>

          <h2>Rankings</h2>
          <div className="rankings-grid">
            <div className="ranking-item">
              <h3>Ranking Geral</h3>
              <p>{stats.rankings.geral}</p>
            </div>
            <div className="ranking-item">
              <h3>Ranking Fácil</h3>
              <p>{stats.rankings.facil}</p>
            </div>
            <div className="ranking-item">
              <h3>Ranking Médio</h3>
              <p>{stats.rankings.medio}</p>
            </div>
            <div className="ranking-item">
              <h3>Ranking Difícil</h3>
              <p>{stats.rankings.dificil}</p>
            </div>
            <div className="ranking-item">
              <h3>Ranking Aleatório</h3>
              <p>{stats.rankings.aleatorio}</p>
            </div>
          </div>

          <h2>Partidas por Dificuldade</h2>
          <div className="difficulty-stats">
            <div className="difficulty-item">
              <span className="difficulty-label">Fácil:</span>
              <span className="difficulty-value">{stats.partidasPorDificuldade.facil}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Médio:</span>
              <span className="difficulty-value">{stats.partidasPorDificuldade.medio}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Difícil:</span>
              <span className="difficulty-value">{stats.partidasPorDificuldade.dificil}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Aleatório:</span>
              <span className="difficulty-value">{stats.partidasPorDificuldade.aleatorio}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Alterar Senha</h2>
          <form onSubmit={handlePasswordChange} className="password-change">
            <div className="form-group">
              <label htmlFor="currentPassword">Senha Atual</label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
              {passwordErrors.currentPassword && (
                <span className="error-text">{passwordErrors.currentPassword}</span>
              )}
            </div>
            <div className="password-requirements">
              <p>A senha deve conter:</p>
              <ul>
                <li>Pelo menos 8 caracteres</li>
                <li>Uma letra maiúscula</li>
                <li>Uma letra minúscula</li>
                <li>Um número</li>
                <li>Um caractere especial (!@#$%^&*)</li>
              </ul>
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
              {passwordErrors.newPassword && (
                <span className="error-text">{passwordErrors.newPassword}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
              {passwordErrors.confirmPassword && (
                <span className="error-text">{passwordErrors.confirmPassword}</span>
              )}
            </div>
            <button type="submit" className="change-password-button">
              Alterar Senha
            </button>
          </form>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 