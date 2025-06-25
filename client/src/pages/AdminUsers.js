import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';
import ConfirmModal from '../components/ConfirmModal';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, userId: null, message: '', isError: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/admin/users${query ? `?search=${query}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      setError('Erro ao buscar usuários.');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleDeleteClick = (id) => {
    setModal({ open: true, userId: id, message: 'Tem certeza que deseja excluir este usuário?', isError: false });
  };

  const handleDeleteConfirm = async () => {
    const id = modal.userId;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
      setModal({ open: true, userId: null, message: 'Usuário excluído com sucesso.', isError: false, onlyConfirm: true });
    } catch (err) {
      let msg = err.response?.data?.message || 'Erro ao excluir usuário.';
      setModal({ open: true, userId: null, message: msg, isError: true, onlyConfirm: true });
    }
  };

  const handleModalClose = () => {
    setModal({ open: false, userId: null, message: '', isError: false });
  };

  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate('/admin')}>Voltar</button>
      <header className="admin-header">
        <h1>Usuários</h1>
      </header>
      <form className="admin-search-form" onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Buscar por ID ou email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-search-input"
        />
        <button type="submit" className="admin-option">Buscar</button>
      </form>
      {loading ? <p>Carregando...</p> : error ? <p>{error}</p> : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <button className="delete-button" onClick={() => handleDeleteClick(user.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ConfirmModal
        open={modal.open}
        title={modal.isError ? 'Erro' : modal.userId ? 'Confirmar Exclusão' : 'Sucesso'}
        message={modal.message}
        onConfirm={modal.userId ? handleDeleteConfirm : handleModalClose}
        onCancel={modal.userId ? handleModalClose : undefined}
        confirmText={modal.userId ? 'Excluir' : 'OK'}
        cancelText="Cancelar"
        onlyConfirm={modal.onlyConfirm}
      />
    </div>
  );
}

export default AdminUsers; 