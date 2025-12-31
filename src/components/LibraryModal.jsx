import React, { useMemo, useState } from 'react';
import { deleteSession } from '../store/useSessionStore.js';
import ModalFrame from './ModalFrame.jsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';
import SessionSettingsSummary from './SessionSettingsSummary.jsx';

export default function LibraryModal({ open, sessions, onClose, onLoad, onDelete }) {
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const sortedSessions = useMemo(
    () => sessions.slice().sort((a, b) => b.timestamp - a.timestamp),
    [sessions]
  );

  const handleDelete = (session) => {
    deleteSession(session.id);
    if (onDelete) onDelete();
    setSessionToDelete(null);
  };

  return (
    <>
      <ModalFrame open={open} titleId="library-title" onClose={onClose}>
        <div className="modal-body modal-body__padded">
          <div className="modal-heading">
            <p className="badge">Archives</p>
            <h2 id="library-title" className="modal-title">
              Mes sessions enregistrées
            </h2>
            <p className="muted">Vérifiez les réglages avant de charger ou de supprimer.</p>
          </div>

          {sortedSessions.length === 0 && (
            <div className="empty-state">
              <p className="badge" style={{ marginBottom: '0.4rem', color: 'var(--slate-400)' }}>
                Le vide est immense
              </p>
              <p className="badge" style={{ color: 'var(--slate-300)' }}>
                Commencez par créer une boucle.
              </p>
            </div>
          )}

          <div className="session-list">
            {sortedSessions.map((session) => (
              <div key={session.id} className="session-card glass-panel" aria-label={`Session ${session.name}`}>
                <div className="session-card__header">
                  <div>
                    <h3 style={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>{session.name}</h3>
                    <div className="session-meta">{new Date(session.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div className="session-actions">
                    <button className="button-primary" onClick={() => onLoad(session)} aria-label={`Charger ${session.name}`}>
                      Ouvrir
                    </button>
                    <button
                      className="small-button danger-outline"
                      onClick={() => setSessionToDelete(session)}
                      aria-label={`Supprimer ${session.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <SessionSettingsSummary
                  settings={{
                    duration: session.duration,
                    speed: session.speed,
                    pingPong: session.pingPong,
                    presence: session.presence,
                  }}
                  title="Réglages sauvegardés"
                />
              </div>
            ))}
          </div>
        </div>
      </ModalFrame>

      <ConfirmDeleteModal
        open={Boolean(sessionToDelete)}
        description={
          sessionToDelete
            ? `La session « ${sessionToDelete.name} » sera supprimée définitivement.`
            : undefined
        }
        onCancel={() => setSessionToDelete(null)}
        onConfirm={() => sessionToDelete && handleDelete(sessionToDelete)}
      />
    </>
  );
}
