import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DificuldadeQuiz.css';

function DificuldadeQuiz() {
  const navigate = useNavigate();

  const handleDificuldade = (dificuldade) => {
    navigate('/quantidade', { state: { dificuldade } });
  };

  return (
    <div className="dificuldade-container">
      <button 
        className="voltar-button"
        onClick={() => navigate('/dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>

      <h1>Escolha a Dificuldade</h1>
      <div className="dificuldade-buttons">
        <button 
          className="dificuldade-button facil"
          onClick={() => handleDificuldade('facil')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Fácil
        </button>
        <button 
          className="dificuldade-button medio"
          onClick={() => handleDificuldade('medio')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Médio
        </button>
        <button 
          className="dificuldade-button dificil"
          onClick={() => handleDificuldade('dificil')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Difícil
        </button>
        <button 
          className="dificuldade-button aleatorio"
          onClick={() => handleDificuldade('aleatorio')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Aleatório
        </button>
      </div>
    </div>
  );
}

export default DificuldadeQuiz; 