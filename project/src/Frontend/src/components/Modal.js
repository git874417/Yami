import React from "react";
import "./../css/Modal.css";

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {actions && actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={index}
                className={`modal-action-button ${action.className || ''}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button className="modal-action-button" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
