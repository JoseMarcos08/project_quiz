import React from 'react';
import '../styles/Admin.css';

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', onlyConfirm = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {title && <h2>{title}</h2>}
        {message && <p>{message}</p>}
        <div className="modal-buttons">
          {!onlyConfirm && <button onClick={onCancel}>{cancelText}</button>}
          <button onClick={onConfirm} className="confirm-button">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal; 