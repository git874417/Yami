import React, { createContext, useState, useContext, useCallback } from "react";
import Modal from "../components/Modal";

// 1. Crear el Contexto
const ModalContext = createContext();

// 2. Crear el Proveedor del Contexto
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    content: null,
    actions: null,
  });

  const showModal = useCallback((title, content, actions = null) => {
    setModalState({
      isOpen: true,
      title,
      content,
      actions,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState({
      isOpen: false,
      title: "",
      content: null,
      actions: null,
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        actions={modalState.actions}
      >
        {modalState.content}
      </Modal>
    </ModalContext.Provider>
  );
};

// 3. Crear un Hook personalizado para usar el contexto fácilmente
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
