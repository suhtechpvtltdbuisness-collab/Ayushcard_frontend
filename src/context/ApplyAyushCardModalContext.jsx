import React, { createContext, useCallback, useContext, useState } from "react";
import ApplyAyushCardModal from "../components/sections/home/ApplyAyushCardModal";

const ApplyAyushCardModalContext = createContext(null);

export function ApplyAyushCardModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openApplyAyushModal = useCallback(() => setIsOpen(true), []);
  const closeApplyAyushModal = useCallback(() => setIsOpen(false), []);

  return (
    <ApplyAyushCardModalContext.Provider
      value={{ openApplyAyushModal, closeApplyAyushModal }}
    >
      {children}
      <ApplyAyushCardModal isOpen={isOpen} onClose={closeApplyAyushModal} />
    </ApplyAyushCardModalContext.Provider>
  );
}

export function useApplyAyushCardModal() {
  const ctx = useContext(ApplyAyushCardModalContext);
  if (!ctx) {
    throw new Error(
      "useApplyAyushCardModal must be used within ApplyAyushCardModalProvider",
    );
  }
  return ctx;
}
