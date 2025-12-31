import React from 'react';
import ModalFrame from './ModalFrame.jsx';

export default function ConfirmDeleteModal({ open, title = 'Confirmer la suppression', description, onCancel, onConfirm }) {
  return (
    <ModalFrame
      open={open}
      titleId="confirm-delete-title"
      descriptionId={description ? 'confirm-delete-desc' : undefined}
      onClose={onCancel}
      role="alertdialog"
    >
      <div className="modal-body modal-body__padded">
        <div className="modal-heading">
          <p className="badge">Attention</p>
          <h2 id="confirm-delete-title" className="modal-title">
            {title}
          </h2>
          {description && (
            <p className="muted" id="confirm-delete-desc">
              {description}
            </p>
          )}
        </div>
        <div className="modal-actions stacked">
          <button type="button" className="ghost danger-outline" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            className="button-primary danger"
            onClick={onConfirm}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
