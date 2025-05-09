import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Ranking.css';

function Ranking() {
  const [rankings, setRankings] = useState([]);
  const [filtroDificuldade, setFiltroDificuldade] = useState('todas');
  const [filtroQuantidade, setFiltroQuantidade] = useState('todas');
  const [tipoRanking, setTipoRanking] = useState('geral'); // 'geral' ou 'melhor'
  const [rankingsFiltrados, setRankingsFiltrados] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar rankings com base nos filtros e tipo de ranking
    buscarRankings();
  }, [filtroDificuldade, filtroQuantidade, tipoRanking]);

  const buscarRankings = () => {
    console.log('Iniciando busca do ranking...', { tipoRanking, filtroDificuldade, filtroQuantidade });
    setCarregando(true);
    setErro(null);
    
    // Construir a URL com os parâmetros
    let url = 'http://localhost:3001/ranking?tipo=' + tipoRanking;
    
    if (filtroDificuldade !== 'todas') {
      url += '&dificuldade=' + filtroDificuldade;
    }
    
    if (filtroQuantidade !== 'todas') {
      url += '&quantidade=' + filtroQuantidade;
    }
    
    console.log('URL da requisição:', url);
    
    fetch(url)
      .then(res => {
        console.log('Status da resposta:', res.status);
        if (!res.ok) {
          return res.text().then(text => {
            console.error('Erro detalhado:', text);
            throw new Error(`Erro na resposta: ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Dados recebidos do servidor:', data);
        if (!data) {
          throw new Error('Nenhum dado recebido do servidor');
        }
        if (Array.isArray(data)) {
          console.log('Quantidade de rankings recebidos:', data.length);
          setRankings(data);
          setRankingsFiltrados(data);
        } else {
          console.error('Formato inválido de dados:', data);
          throw new Error('Formato de dados inválido recebido do servidor');
        }
        setCarregando(false);
      })
      .catch(err => {
        console.error('Erro detalhado ao buscar rankings:', err);
        setErro(`Erro ao carregar o ranking: ${err.message}`);
        setCarregando(false);
      });
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    
    try {
      const data = new Date(dataString);
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        console.error('Data inválida:', dataString);
        return 'Data inválida';
      }
      
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  const formatarTempo = (segundos) => {
    if (!segundos) return 'N/A';
    
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
  };

  const resetarFiltros = () => {
    setFiltroDificuldade('todas');
    setFiltroQuantidade('todas');
    setTipoRanking('geral');
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const renderizarConteudoRanking = () => {
    if (tipoRanking === 'geral') {
        return (
            <div className="ranking-tabela" data-tipo="geral">
                <div className="ranking-cabecalho">
                    <div className="coluna-posicao">Posição</div>
                    <div className="coluna-jogador">Jogador</div>
                    <div className="coluna-pontuacao">Pontuação Total</div>
                    <div className="coluna-acertos">Acertos/Erros</div>
                    <div className="coluna-quantidade">Total Partidas</div>
                </div>
                {rankingsFiltrados.map((ranking, index) => (
                    <div key={index} className="ranking-linha">
                        <div className="coluna-posicao">{index + 1}º</div>
                        <div 
                            className="coluna-jogador"
                            onClick={() => navigate(`/player/${ranking.id_usuario}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {ranking.nome_usuario}
                        </div>
                        <div className="coluna-pontuacao">{ranking.pontuacao_total}</div>
                        <div className="coluna-acertos">{ranking.acertos_total}/{ranking.erros_total}</div>
                        <div className="coluna-quantidade">{ranking.total_partidas}</div>
                    </div>
                ))}
            </div>
        );
    } else {
        return (
            <div className="ranking-tabela" data-tipo="melhor">
                <div className="ranking-cabecalho">
                    <div className="coluna-posicao">Posição</div>
                    <div className="coluna-jogador">Jogador</div>
                    <div className="coluna-pontuacao">Pontuação</div>
                    <div className="coluna-acertos">Acertos/Erros</div>
                    <div className="coluna-quantidade">Quantidade</div>
                    <div className="coluna-dificuldade">Dificuldade</div>
                    <div className="coluna-tempo">Tempo</div>
                </div>
                {rankingsFiltrados.map((ranking, index) => (
                    <div key={index} className="ranking-linha">
                        <div className="coluna-posicao">{index + 1}º</div>
                        <div 
                            className="coluna-jogador"
                            onClick={() => navigate(`/player/${ranking.id_usuario}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {ranking.nome_usuario}
                        </div>
                        <div className="coluna-pontuacao">{ranking.pontuacao}</div>
                        <div className="coluna-acertos">{ranking.acertos}/{ranking.erros}</div>
                        <div className="coluna-quantidade">{ranking.quantidade_perguntas}</div>
                        <div className="coluna-dificuldade">
                            <span className={`dificuldade ${ranking.dificuldade}`}>
                                {ranking.dificuldade}
                            </span>
                        </div>
                        <div className="coluna-tempo">
                            {formatarTempo(ranking.tempo_total)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
  };

  return (
    <div className="ranking-container">
      <button 
        className="voltar-button"
        onClick={() => navigate('/dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>

      <div className="ranking-content">
        <h1>Ranking Global</h1>
        
        {carregando ? (
          <div className="carregando">
            <p>Carregando rankings...</p>
          </div>
        ) : erro ? (
          <div className="erro-mensagem">
            <p>{erro}</p>
            <button 
              className="tentar-novamente-button"
              onClick={() => buscarRankings()}
            >
              Tentar Novamente
            </button>
          </div>
        ) : rankings.length === 0 ? (
          <div className="sem-dados">
            <p>Nenhuma partida encontrada no ranking.</p>
            <p>Jogue algumas partidas para aparecer no ranking!</p>
            <button 
              className="resetar-filtros-button"
              onClick={resetarFiltros}
            >
              Resetar Filtros
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
                <div className="filtros-wrapper">
                  <div className="filtros-grupos">
                    <div className="filtro-grupo">
                      <label htmlFor="tipo-ranking">Tipo de Ranking:</label>
                      <select 
                        id="tipo-ranking"
                        value={tipoRanking}
                        onChange={(e) => setTipoRanking(e.target.value)}
                      >
                        <option value="geral">Pontuação Geral</option>
                        {(filtroDificuldade !== 'todas' || filtroQuantidade !== 'todas') && (
                          <option value="melhor">Melhor Partida</option>
                        )}
                      </select>
                    </div>
                    
                    <div className="filtro-grupo">
                      <label htmlFor="filtro-dificuldade">Dificuldade:</label>
                      <select 
                        id="filtro-dificuldade"
                        value={filtroDificuldade}
                        onChange={(e) => {
                          setFiltroDificuldade(e.target.value);
                          if (e.target.value === 'todas' && filtroQuantidade === 'todas') {
                            setTipoRanking('geral');
                          }
                        }}
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
                        onChange={(e) => {
                          setFiltroQuantidade(e.target.value);
                          if (e.target.value === 'todas' && filtroDificuldade === 'todas') {
                            setTipoRanking('geral');
                          }
                        }}
                      >
                        <option value="todas">Todas</option>
                        <option value="10">10 perguntas</option>
                        <option value="25">25 perguntas</option>
                        <option value="50">50 perguntas</option>
                        <option value="75">75 perguntas</option>
                        <option value="100">100 perguntas</option>
                      </select>
                    </div>
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
            
            <div className="ranking-tabela" data-tipo={tipoRanking}>
              {renderizarConteudoRanking()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Ranking; 