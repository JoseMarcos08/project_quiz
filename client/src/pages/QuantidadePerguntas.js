import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/QuantidadePerguntas.css';

function QuantidadePerguntas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dificuldade } = location.state || { dificuldade: 'medio' };

  const handleQuantidade = (quantidade) => {
    navigate('/quiz', { 
      state: { 
        dificuldade,
        quantidade 
      } 
    });
  };

  const handleVoltar = () => {
    navigate('/dificuldade');
  };

  return (
    <div className="quantidade-container">
      <button 
        className="voltar-button"
        onClick={handleVoltar}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>

      <h1>Selecione a Quantidade de Perguntas</h1>
      
      <div className="quantidade-content">
        <div className="quantidade-info">
          <p className="dificuldade-selecionada">
            Dificuldade: 
            <span className={dificuldade}>
              {dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1)}
            </span>
          </p>
        </div>

        <div className="quantidade-buttons">
          <button 
            className="quantidade-button"
            onClick={() => handleQuantidade(10)}
          >
            10 Perguntas
          </button>
          <button 
            className="quantidade-button"
            onClick={() => handleQuantidade(25)}
          >
            25 Perguntas
          </button>
          <button 
            className="quantidade-button"
            onClick={() => handleQuantidade(50)}
          >
            50 Perguntas
          </button>
          <button 
            className="quantidade-button"
            onClick={() => handleQuantidade(75)}
          >
            75 Perguntas
          </button>
          <button 
            className="quantidade-button"
            onClick={() => handleQuantidade(100)}
          >
            100 Perguntas
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuantidadePerguntas; 