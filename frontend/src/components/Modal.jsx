import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;

  const modalClasses = [
    'modal',
    size !== 'md' && `modal-${size}`,
    className
  ].filter(Boolean).join(' ');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={modalClasses}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
