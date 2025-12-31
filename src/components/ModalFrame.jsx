import React, { useEffect } from 'react';

export default function ModalFrame({ open, titleId, descriptionId, onClose, children, wide = false, role = 'dialog' }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay active"
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={onClose}
    >
      <div
        className={`modal-content ${wide ? 'wide' : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="document"
      >
        {children}
      </div>
    </div>
  );
}
