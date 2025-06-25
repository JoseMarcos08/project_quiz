import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Quiz.css';

function Quiz() {
  // Estados do Quiz
  const [quizState, setQuizState] = useState({
    pergunta: null,
    perguntas: [],
    perguntaAtual: 0,
    pontuacao: 0,
    erros: 0,
    tempoRestante: 30,
    tempoTotal: 0,
    tempoInicio: null,
    pontuacaoFinal: 0,
    mostrarResultado: false,
    respostaAtual: null,
    perguntaRespondida: false,
    animacaoResposta: null,
    mostrarModal: false,
    isGuest: false,
    userId: null
  });

  // Refs para valores que precisam ser acessados de forma síncrona
  const pontuacaoRef = useRef(0);
  const errosRef = useRef(0);
  const tempoInicioRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { dificuldade, quantidade } = location.state || { dificuldade: 'medio', quantidade: 10 };

  // Carregar perguntas quando o componente montar
  useEffect(() => {
    carregarPerguntas();
    verificarUsuario();
  }, [dificuldade, quantidade]);

  // Timer do quiz
  useEffect(() => {
    let timer;
    if (quizState.tempoRestante > 0 && !quizState.mostrarResultado && !quizState.respostaAtual) {
      timer = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          tempoRestante: prev.tempoRestante - 1
        }));
      }, 1000);
    } else if (quizState.tempoRestante === 0 && !quizState.mostrarResultado && !quizState.respostaAtual) {
      // Tempo esgotado, contar como erro
      errosRef.current += 1;
      setQuizState(prev => ({
        ...prev,
        erros: errosRef.current
      }));
      proximaPergunta();
    }
    return () => clearInterval(timer);
  }, [quizState.tempoRestante, quizState.mostrarResultado, quizState.respostaAtual]);

  // Verificar se o usuário está logado
  const verificarUsuario = useCallback(async () => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      try {
        const response = await fetch(`http://localhost:3001/usuarios/buscar?email=${email}`);
        const data = await response.json();
        if (data.id) {
          setQuizState(prev => ({
            ...prev,
            userId: data.id,
            isGuest: false
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setQuizState(prev => ({ ...prev, isGuest: true }));
      }
    } else {
      setQuizState(prev => ({ ...prev, isGuest: true }));
    }
  }, []);

  // Carregar perguntas do servidor
  const carregarPerguntas = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/perguntas?dificuldade=${dificuldade}&quantidade=${quantidade}`
      );
      const data = await response.json();
      tempoInicioRef.current = Date.now();
      setQuizState(prev => ({
        ...prev,
        perguntas: data,
        pergunta: data[0],
        tempoInicio: tempoInicioRef.current
      }));
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  }, [dificuldade, quantidade]);

  // Calcular pontuação final
  const calcularPontuacaoFinal = useCallback((acertos, erros, tempoTotal, dificuldade) => {
    // Pontos base por acerto (varia conforme a dificuldade)
    const pontosPorAcerto = {
      facil: 50,    // Mais fácil, menos pontos
      medio: 100,   // Dificuldade média, pontos médios
      dificil: 200, // Mais difícil, mais pontos
      aleatorio: 150 // Média entre médio e difícil
    };

    // Penalidade por erro (varia conforme a dificuldade)
    const penalidadePorErro = {
      facil: 25,    // Menos penalidade
      medio: 50,    // Penalidade média
      dificil: 75,  // Maior penalidade
      aleatorio: 60 // Penalidade intermediária
    };

    // Bônus de tempo (varia conforme a dificuldade)
    const tempoMaximo = {
      facil: 360,   // 6 minutos
      medio: 300,   // 5 minutos
      dificil: 240, // 4 minutos
      aleatorio: 300 // 5 minutos
    };

    const bônusMaximo = {
      facil: 300,   // Bônus menor para fácil
      medio: 500,   // Bônus médio
      dificil: 800, // Bônus maior para difícil
      aleatorio: 600 // Bônus intermediário
    };

    // Calcular pontos base
    const pontosAcertos = acertos * pontosPorAcerto[dificuldade];
    
    // Calcular penalidades
    const pontosErros = erros * penalidadePorErro[dificuldade];
    
    // Calcular bônus de tempo
    const tempoRestante = Math.max(0, tempoMaximo[dificuldade] - tempoTotal);
    const bônusTempo = Math.round(
      (tempoRestante / tempoMaximo[dificuldade]) * bônusMaximo[dificuldade]
    );

    // Pontuação final
    const pontuacaoFinal = Math.max(0, pontosAcertos - pontosErros + bônusTempo);

    console.log('Cálculo da pontuação:', {
      dificuldade,
      acertos,
      erros,
      tempoTotal,
      pontosPorAcerto: pontosPorAcerto[dificuldade],
      penalidadePorErro: penalidadePorErro[dificuldade],
      pontosAcertos,
      pontosErros,
      bônusTempo,
      pontuacaoFinal
    });

    return pontuacaoFinal;
  }, []);

  // Verificar resposta do usuário
  const verificarResposta = useCallback((alternativa) => {
    const estaCorreta = alternativa === quizState.pergunta.resposta_correta;
    
    // Atualizar refs imediatamente
    if (estaCorreta) {
      pontuacaoRef.current += 1;
    } else {
      errosRef.current += 1;
    }

    setQuizState(prev => ({
      ...prev,
      respostaAtual: alternativa,
      perguntaRespondida: true,
      animacaoResposta: {
        alternativa,
        tipo: estaCorreta ? 'acerto' : 'erro'
      },
      pontuacao: pontuacaoRef.current,
      erros: errosRef.current
    }));

    setTimeout(() => {
      setQuizState(prev => ({
        ...prev,
        animacaoResposta: null,
        respostaAtual: null
      }));
      proximaPergunta();
    }, 800);
  }, [quizState.pergunta]);

  // Próxima pergunta
  const proximaPergunta = useCallback(() => {
    if (quizState.perguntaAtual < quizState.perguntas.length - 1) {
      setQuizState(prev => ({
        ...prev,
        perguntaAtual: prev.perguntaAtual + 1,
        pergunta: prev.perguntas[prev.perguntaAtual + 1],
        tempoRestante: 30,
        perguntaRespondida: false
      }));
    } else {
      const tempoFinal = Date.now();
      const tempoTotalEmSegundos = Math.floor((tempoFinal - tempoInicioRef.current) / 1000);
      
      // Usar os valores dos refs que são garantidamente atualizados
      const acertosAtuais = pontuacaoRef.current;
      const errosAtuais = errosRef.current;
      
      console.log('Valores finais antes do cálculo:', {
        acertos: acertosAtuais,
        erros: errosAtuais,
        tempoTotal: tempoTotalEmSegundos,
        dificuldade: location.state?.dificuldade || 'medio'
      });

      const pontuacaoFinal = calcularPontuacaoFinal(
        acertosAtuais,
        errosAtuais,
        tempoTotalEmSegundos,
        location.state?.dificuldade || 'medio'
      );

      setQuizState(prev => ({
        ...prev,
        tempoTotal: tempoTotalEmSegundos,
        pontuacaoFinal,
        mostrarResultado: true,
        pontuacao: acertosAtuais,
        erros: errosAtuais
      }));

      // Salvar resultados com os valores dos refs
      salvarResultados(
        acertosAtuais,
        errosAtuais,
        pontuacaoFinal,
        tempoTotalEmSegundos
      );
    }
  }, [quizState, calcularPontuacaoFinal]);

  // Salvar resultados
  const salvarResultados = useCallback(async (acertos, erros, pontuacaoFinal, tempoTotal) => {
    if (!quizState.isGuest && quizState.userId) {
      console.log('Dados sendo salvos:', {
        acertos,
        erros,
        pontuacaoFinal,
        tempoTotal,
        totalPerguntas: quizState.perguntas.length
      });

      const dadosPartida = {
        id_usuario: quizState.userId,
        quantidade_perguntas: quizState.perguntas.length,
        pontuacao: pontuacaoFinal,
        acertos,
        erros,
        tempo_total: tempoTotal,
        dificuldade: location.state?.dificuldade || 'medio'
      };

      try {
        const response = await fetch('http://localhost:3001/salvar-partida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosPartida)
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar partida');
        }

        const data = await response.json();
        console.log('Resposta do servidor:', data);
      } catch (error) {
        console.error('Erro ao salvar resultados:', error);
      }
    }
  }, [quizState.isGuest, quizState.userId, quizState.perguntas.length, location.state?.dificuldade]);

  // Funções auxiliares
  const reiniciarQuiz = useCallback(() => {
    pontuacaoRef.current = 0;
    errosRef.current = 0;
    tempoInicioRef.current = Date.now();
    
    setQuizState(prev => ({
      ...prev,
      perguntaAtual: 0,
      pontuacao: 0,
      erros: 0,
      tempoTotal: 0,
      pontuacaoFinal: 0,
      mostrarResultado: false,
      pergunta: prev.perguntas[0],
      tempoInicio: tempoInicioRef.current
    }));
  }, []);

  const abrirModal = useCallback(() => {
    setQuizState(prev => ({ ...prev, mostrarModal: true }));
  }, []);

  const fecharModal = useCallback(() => {
    setQuizState(prev => ({ ...prev, mostrarModal: false }));
  }, []);

  const confirmarVoltar = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const formatarTempo = useCallback((segundos) => {
    if (!segundos) return '0:00';
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }, []);

  const getMensagemDesempenho = useCallback(() => {
    const percentualAcerto = (pontuacaoRef.current / quizState.perguntas.length) * 100;

    if (percentualAcerto === 100) {
      return {
        titulo: "Impressionante! Você é Incrível!",
        mensagem: "Você acertou todas as questões! Um desempenho verdadeiramente excepcional!"
      };
    } else if (percentualAcerto >= 80) {
      return {
        titulo: "Excelente Trabalho!",
        mensagem: "Você teve um ótimo desempenho! Continue assim!"
      };
    } else if (percentualAcerto >= 60) {
      return {
        titulo: "Bom Trabalho!",
        mensagem: "Você está no caminho certo! Continue praticando!"
      };
    } else if (percentualAcerto >= 40) {
      return {
        titulo: "Continue Tentando!",
        mensagem: "Você pode melhorar! Não desista!"
      };
    } else {
      return {
        titulo: "Não Desanime!",
        mensagem: "Todo começo é difícil. Tente novamente e melhore seu desempenho!"
      };
    }
  }, [quizState.perguntas.length]);

  // Renderização condicional
  if (!quizState.pergunta) {
    return <div className="quiz-container">Carregando...</div>;
  }

  if (quizState.mostrarResultado) {
    const mensagemDesempenho = getMensagemDesempenho();
    
    return (
      <div className="quiz-page">
        <button 
          className="voltar-button"
          onClick={abrirModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
        <div className="quiz-container resultado-container">
          <h2>{mensagemDesempenho.titulo}</h2>
          <div className={`resultado-mensagem ${quizState.isGuest ? 'guest' : 'user'}`}>
            <p className="destaque">{mensagemDesempenho.mensagem}</p>
            {quizState.isGuest ? (
              <>
                <p className="aviso">Como você está jogando como convidado, seus resultados não serão salvos.</p>
                <p>Para salvar suas pontuações, crie uma conta ou faça login!</p>
              </>
            ) : (
              <p>Seus resultados foram salvos com sucesso!</p>
            )}
          </div>

          <div className="resultado-detalhes">
            <div className="resultado-item">
              <span className="resultado-label">Pontuação Final:</span>
              <span className="resultado-valor pontuacao-final">{quizState.pontuacaoFinal} pontos</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Acertos:</span>
              <span className="resultado-valor acerto">{pontuacaoRef.current} de {quizState.perguntas.length}</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Taxa de Acerto:</span>
              <span className="resultado-valor acerto">{(pontuacaoRef.current / quizState.perguntas.length * 100).toFixed(1)}%</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Erros:</span>
              <span className="resultado-valor erro">{errosRef.current}</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-label">Tempo Total:</span>
              <span className="resultado-valor tempo">{formatarTempo(quizState.tempoTotal)}</span>
            </div>
          </div>

          <div className="botoes-container">
            <button onClick={reiniciarQuiz} className="quiz-button">
              Jogar Novamente
            </button>
            {quizState.isGuest && (
              <button onClick={() => navigate('/login')} className="quiz-button login-button">
                Fazer Login
              </button>
            )}
            <button onClick={confirmarVoltar} className="quiz-button botao-voltar">
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <button 
        className="voltar-button"
        onClick={abrirModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
      <div className="quiz-container">
        <div className="quiz-header">
          <h2 className="quiz-question-counter">
            Pergunta {quizState.perguntaAtual + 1} de {quizState.perguntas.length}
          </h2>

          <div className="quiz-info">
            <p className="tempo-restante">Tempo: {formatarTempo(quizState.tempoRestante)}</p>
            <p className="pontuacao">Pontuação: {pontuacaoRef.current}</p>
          </div>
        </div>
        
        <div className="pergunta-container">
          <h3>{quizState.pergunta.enunciado}</h3>
        </div>

        <div className="alternativas-container">
          <button 
            onClick={() => verificarResposta('A')}
            className={`alternativa-button ${
              quizState.animacaoResposta?.alternativa === 'A' 
                ? quizState.animacaoResposta.tipo 
                : ''
            }`}
            disabled={quizState.animacaoResposta !== null}
          >
            A) {quizState.pergunta.alternativa_a}
          </button>
          <button 
            onClick={() => verificarResposta('B')}
            className={`alternativa-button ${
              quizState.animacaoResposta?.alternativa === 'B' 
                ? quizState.animacaoResposta.tipo 
                : ''
            }`}
            disabled={quizState.animacaoResposta !== null}
          >
            B) {quizState.pergunta.alternativa_b}
          </button>
          <button 
            onClick={() => verificarResposta('C')}
            className={`alternativa-button ${
              quizState.animacaoResposta?.alternativa === 'C' 
                ? quizState.animacaoResposta.tipo 
                : ''
            }`}
            disabled={quizState.animacaoResposta !== null}
          >
            C) {quizState.pergunta.alternativa_c}
          </button>
          <button 
            onClick={() => verificarResposta('D')}
            className={`alternativa-button ${
              quizState.animacaoResposta?.alternativa === 'D' 
                ? quizState.animacaoResposta.tipo 
                : ''
            }`}
            disabled={quizState.animacaoResposta !== null}
          >
            D) {quizState.pergunta.alternativa_d}
          </button>
        </div>
      </div>

      {quizState.mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Atenção!</h3>
            <p className="modal-message">
              Você realmente deseja voltar para o Dashboard? Todo o seu progresso será perdido.
            </p>
            <div className="modal-buttons">
              <button 
                className="modal-button confirmar"
                onClick={confirmarVoltar}
              >
                Sim, voltar
              </button>
              <button 
                className="modal-button cancelar"
                onClick={fecharModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz; 