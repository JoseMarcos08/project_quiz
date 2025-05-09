import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';
import ConfirmModal from '../components/ConfirmModal';

const dificuldades = ['facil', 'medio', 'dificil'];
const dificuldadeLabel = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil'
};

function AdminQuestions() {
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDificuldades, setSelectedDificuldades] = useState(dificuldades);
  const [modal, setModal] = useState({ open: false, perguntaId: null, message: '', isError: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerguntas();
  }, []);

  const fetchPerguntas = async (query = '', dificuldadesArr = dificuldades) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:3001/admin/questions';
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (dificuldadesArr.length > 0 && dificuldadesArr.length < dificuldades.length) {
        params.push(`dificuldade=${dificuldadesArr.join(',')}`);
      }
      if (params.length > 0) url += '?' + params.join('&');
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerguntas(res.data);
    } catch (err) {
      setError('Erro ao buscar perguntas.');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPerguntas(search, selectedDificuldades);
  };

  const handleDeleteClick = (id) => {
    setModal({ open: true, perguntaId: id, message: 'Tem certeza que deseja excluir esta pergunta?', isError: false });
  };

  const handleDeleteConfirm = async () => {
    const id = modal.perguntaId;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerguntas(perguntas.filter(p => p.id !== id));
      setModal({ open: true, perguntaId: null, message: 'Pergunta excluída com sucesso.', isError: false, onlyConfirm: true });
    } catch (err) {
      let msg = err.response?.data?.message || 'Erro ao excluir pergunta.';
      setModal({ open: true, perguntaId: null, message: msg, isError: true, onlyConfirm: true });
    }
  };

  const handleModalClose = () => {
    setModal({ open: false, perguntaId: null, message: '', isError: false });
  };

  const handleDificuldadeChange = (dif) => {
    let novas;
    if (selectedDificuldades.includes(dif)) {
      novas = selectedDificuldades.filter(d => d !== dif);
    } else {
      novas = [...selectedDificuldades, dif];
    }
    if (novas.length === 0) novas = [...dificuldades];
    setSelectedDificuldades(novas);
    fetchPerguntas(search, novas);
  };

  // Agrupar perguntas por dificuldade
  const perguntasPorDificuldade = {};
  dificuldades.forEach(dif => {
    perguntasPorDificuldade[dif] = perguntas.filter(p => p.nivel_dificuldade === dif);
  });

  const nenhumaPergunta = !loading && perguntas.length === 0;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Perguntas</h1>
        <button className="back-button" onClick={() => navigate('/admin')}>Voltar</button>
      </header>
      <form className="admin-search-form" onSubmit={handleSearch} style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por ID ou enunciado"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-search-input"
        />
        <div className="dificuldade-checkbox-group">
          {dificuldades.map(dif => (
            <label key={dif} className="dificuldade-checkbox-label">
              <input
                type="checkbox"
                checked={selectedDificuldades.includes(dif)}
                onChange={() => handleDificuldadeChange(dif)}
              />
              {dificuldadeLabel[dif]}
            </label>
          ))}
        </div>
        <button type="submit" className="admin-option">Buscar</button>
      </form>
      {loading ? <p>Carregando...</p> : error ? <p>{error}</p> : nenhumaPergunta ? (
        <p className="questions-empty">Nenhuma pergunta encontrada.</p>
      ) : (
        <div className="admin-questions-list">
          {dificuldades.map(dif => (
            (selectedDificuldades.includes(dif)) && (
              <div key={dif} className="questions-group">
                <h2 className="questions-group-title">{dificuldadeLabel[dif]}</h2>
                {perguntasPorDificuldade[dif].length === 0 ? (
                  <p className="questions-empty">Nenhuma pergunta nesta dificuldade.</p>
                ) : (
                  <table className="admin-questions-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Enunciado</th>
                        <th>Alternativa A</th>
                        <th>Alternativa B</th>
                        <th>Alternativa C</th>
                        <th>Alternativa D</th>
                        <th>Resposta</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perguntasPorDificuldade[dif].map(pergunta => (
                        <tr key={pergunta.id}>
                          <td>{pergunta.id}</td>
                          <td>{pergunta.enunciado}</td>
                          <td>{pergunta.alternativa_a}</td>
                          <td>{pergunta.alternativa_b}</td>
                          <td>{pergunta.alternativa_c}</td>
                          <td>{pergunta.alternativa_d}</td>
                          <td>{pergunta.resposta_correta}</td>
                          <td>
                            <button className="delete-button" onClick={() => handleDeleteClick(pergunta.id)}>Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          ))}
        </div>
      )}
      <ConfirmModal
        open={modal.open}
        title={modal.isError ? 'Erro' : modal.perguntaId ? 'Confirmar Exclusão' : 'Sucesso'}
        message={modal.message}
        onConfirm={modal.perguntaId ? handleDeleteConfirm : handleModalClose}
        onCancel={modal.perguntaId ? handleModalClose : undefined}
        confirmText={modal.perguntaId ? 'Excluir' : 'OK'}
        cancelText="Cancelar"
        onlyConfirm={modal.onlyConfirm}
      />
    </div>
  );
}

export default AdminQuestions; 