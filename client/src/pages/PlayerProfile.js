import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Profile.css';

const PlayerProfile = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        // Buscar dados do jogador pelo ID
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/usuarios/${playerId}`);
        if (!userResponse.ok) {
          throw new Error('Erro ao buscar dados do jogador');
        }
        const userData = await userResponse.json();
        
        if (!userData.id) {
          throw new Error('Jogador não encontrado');
        }

        // Buscar partidas do jogador
        const partidasResponse = await fetch(`${process.env.REACT_APP_API_URL}/partidas/${userData.id}`);
        if (!partidasResponse.ok) {
          throw new Error('Erro ao buscar partidas do jogador');
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

        setPlayer({
          id: userData.id,
          email: userData.email
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
        console.error('Erro ao carregar dados do jogador:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  if (loading) {
    return <div className="profile-container"><div className="loading">Carregando...</div></div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Erro</h1>
          <button className="back-button" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
        <div className="profile-content">
          <div className="profile-section">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
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
          <div className="user-info">
            <p><strong>Email:</strong> {player?.email}</p>
            <p><strong>ID:</strong> {player?.id}</p>
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
      </div>
    </div>
  );
};

export default PlayerProfile; 