import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoricoPartidas.css';

function HistoricoPartidas() {
  const [partidas, setPartidas] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();
  
  // Estados para os filtros
  const [filtroDificuldade, setFiltroDificuldade] = useState('todas');
  const [filtroQuantidade, setFiltroQuantidade] = useState('todas');
  const [filtroDesempenho, setFiltroDesempenho] = useState('todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [partidasFiltradas, setPartidasFiltradas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Buscar o ID do usuário
      fetch(`http://localhost:3001/usuarios/buscar?email=${email}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUserId(data.id);
            setIsGuest(false);
            // Buscar histórico de partidas
            fetch(`http://localhost:3001/partidas/${data.id}`)
              .then(res => res.json())
              .then(partidas => {
                setPartidas(partidas);
                setPartidasFiltradas(partidas);
              })
              .catch(err => {
                console.error('Erro ao buscar histórico:', err);
              });
          }
        })
        .catch(err => {
          console.error('Erro ao buscar usuário:', err);
          setIsGuest(true);
        });
    } else {
      setIsGuest(true);
    }
  }, []);

  // Efeito para aplicar os filtros quando eles mudarem
  useEffect(() => {
    if (partidas.length > 0) {
      let resultado = [...partidas];
      
      // Filtrar por dificuldade
      if (filtroDificuldade !== 'todas') {
        resultado = resultado.filter(partida => partida.dificuldade === filtroDificuldade);
      }
      
      // Filtrar por quantidade de perguntas
      if (filtroQuantidade !== 'todas') {
        const quantidade = parseInt(filtroQuantidade);
        resultado = resultado.filter(partida => partida.quantidade_perguntas === quantidade);
      }
      
      // Filtrar por desempenho
      if (filtroDesempenho !== 'todos') {
        resultado = resultado.filter(partida => {
          const taxaAcerto = (partida.acertos / partida.quantidade_perguntas) * 100;
          
          switch (filtroDesempenho) {
            case 'excelente':
              return taxaAcerto >= 80;
            case 'bom':
              return taxaAcerto >= 60 && taxaAcerto < 80;
            case 'medio':
              return taxaAcerto >= 40 && taxaAcerto < 60;
            case 'ruim':
              return taxaAcerto < 40;
            default:
              return true;
          }
        });
      }
      
      // Filtrar por data
      if (filtroDataInicio) {
        const dataInicio = new Date(filtroDataInicio + 'T00:00:00');
        dataInicio.setHours(0, 0, 0, 0); // Início do dia
        resultado = resultado.filter(partida => {
          const dataPartida = new Date(partida.data_partida);
          dataPartida.setHours(0, 0, 0, 0); // Normalizar a data da partida para início do dia
          return dataPartida >= dataInicio;
        });
      }
      
      if (filtroDataFim) {
        const dataFim = new Date(filtroDataFim + 'T23:59:59');
        dataFim.setHours(23, 59, 59, 999); // Fim do dia
        resultado = resultado.filter(partida => {
          const dataPartida = new Date(partida.data_partida);
          return dataPartida <= dataFim;
        });
      }
      
      setPartidasFiltradas(resultado);
    }
  }, [filtroDificuldade, filtroQuantidade, filtroDesempenho, filtroDataInicio, filtroDataFim, partidas]);

  const formatarTempo = (segundos) => {
    if (!segundos) return '0:00';
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const resetarFiltros = () => {
    setFiltroDificuldade('todas');
    setFiltroQuantidade('todas');
    setFiltroDesempenho('todos');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  // Função para obter a data mínima (1 ano atrás)
  const getDataMinima = () => {
    const data = new Date();
    data.setFullYear(data.getFullYear() - 1);
    return data.toISOString().split('T')[0];
  };

  // Função para obter a data máxima (hoje)
  const getDataMaxima = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (isGuest) {
    return (
      <div className="historico-container">
        <button 
          className="voltar-button"
          onClick={() => navigate('/dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
        <div className="historico-content">
          <h1>Histórico de Partidas</h1>
          <div className="guest-message">
            <p>Você precisa estar logado para ver seu histórico de partidas.</p>
            <button 
              className="login-button"
              onClick={() => navigate('/login')}
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="historico-container">
      <button 
        className="voltar-button"
        onClick={() => navigate('/dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>

      <div className="historico-content">
        <h1>Histórico de Partidas</h1>
        
        {partidas.length === 0 ? (
          <div className="sem-partidas">
            <p>Você ainda não jogou nenhuma partida.</p>
            <button 
              className="jogar-button"
              onClick={() => navigate('/dificuldade')}
            >
              Jogar Agora
            </button>
          </div>
        ) : (
          <>
            <div className="filtros-container">
              <button 
                className="toggle-filtros-button"
                onClick={toggleFiltros}
              >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              
              {mostrarFiltros && (
                <div className="filtros-painel">
                  <div className="filtro-grupo">
                    <label htmlFor="filtro-dificuldade">Dificuldade:</label>
                    <select 
                      id="filtro-dificuldade"
                      value={filtroDificuldade}
                      onChange={(e) => setFiltroDificuldade(e.target.value)}
                    >
                      <option value="todas">Todas</option>
                      <option value="facil">Fácil</option>
                      <option value="medio">Médio</option>
                      <option value="dificil">Difícil</option>
                      <option value="aleatorio">Aleatório</option>
                    </select>
                  </div>
                  
                  <div className="filtro-grupo">
                    <label htmlFor="filtro-quantidade">Quantidade de Perguntas:</label>
                    <select 
                      id="filtro-quantidade"
                      value={filtroQuantidade}
                      onChange={(e) => setFiltroQuantidade(e.target.value)}
                    >
                      <option value="todas">Todas</option>
                      <option value="10">10 perguntas</option>
                      <option value="25">25 perguntas</option>
                      <option value="50">50 perguntas</option>
                      <option value="75">75 perguntas</option>
                      <option value="100">100 perguntas</option>
                    </select>
                  </div>
                  
                  <div className="filtro-grupo">
                    <label htmlFor="filtro-desempenho">Desempenho:</label>
                    <select 
                      id="filtro-desempenho"
                      value={filtroDesempenho}
                      onChange={(e) => setFiltroDesempenho(e.target.value)}
                    >
                      <option value="todos">Todos</option>
                      <option value="excelente">Excelente (≥80%)</option>
                      <option value="bom">Bom (60-79%)</option>
                      <option value="medio">Médio (40-59%)</option>
                      <option value="ruim">Ruim (&lt;40%)</option>
                    </select>
                  </div>
                  
                  <div className="filtro-grupo">
                    <label htmlFor="filtro-data-inicio">Data Inicial:</label>
                    <input 
                      type="date" 
                      id="filtro-data-inicio"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      min={getDataMinima()}
                      max={getDataMaxima()}
                    />
                  </div>
                  
                  <div className="filtro-grupo">
                    <label htmlFor="filtro-data-fim">Data Final:</label>
                    <input 
                      type="date" 
                      id="filtro-data-fim"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      min={filtroDataInicio || getDataMinima()}
                      max={getDataMaxima()}
                    />
                  </div>
                  
                  <button 
                    className="resetar-filtros-button"
                    onClick={resetarFiltros}
                  >
                    Resetar Filtros
                  </button>
                </div>
              )}
            </div>
            
            <div className="resultados-filtro">
              <p>Mostrando {partidasFiltradas.length} de {partidas.length} partidas</p>
            </div>
            
            <div className="partidas-grid">
              {partidasFiltradas.map((partida, index) => (
                <div key={partida.id} className="partida-card">
                  <div className="partida-header">
                    <span className="partida-data">{formatarData(partida.data_partida)}</span>
                    <span className={`partida-dificuldade ${partida.dificuldade}`}>
                      {partida.dificuldade.charAt(0).toUpperCase() + partida.dificuldade.slice(1)}
                    </span>
                  </div>
                  <div className="partida-detalhes">
                    <div className="partida-item">
                      <span className="label">Pontuação:</span>
                      <span className="valor pontuacao">{partida.pontuacao} pontos</span>
                    </div>
                    <div className="partida-item">
                      <span className="label">Acertos:</span>
                      <span className="valor acerto">{partida.acertos} de {partida.quantidade_perguntas}</span>
                    </div>
                    <div className="partida-item">
                      <span className="label">Taxa de Acerto:</span>
                      <span className="valor acerto">
                        {((partida.acertos / partida.quantidade_perguntas) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="partida-item">
                      <span className="label">Erros:</span>
                      <span className="valor erro">{partida.erros}</span>
                    </div>
                    <div className="partida-item">
                      <span className="label">Tempo:</span>
                      <span className="valor tempo">{formatarTempo(partida.tempo_total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {partidasFiltradas.length === 0 && (
              <div className="sem-resultados">
                <p>Nenhuma partida encontrada com os filtros selecionados.</p>
                <button 
                  className="resetar-filtros-button"
                  onClick={resetarFiltros}
                >
                  Resetar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HistoricoPartidas; 