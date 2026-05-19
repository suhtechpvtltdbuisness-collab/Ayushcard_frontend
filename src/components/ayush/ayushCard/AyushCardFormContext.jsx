import { createContext, useContext } from "react";

export const AyushCardFormContext = createContext(null);

export function useAyushCardForm() {
  const ctx = useContext(AyushCardFormContext);
  if (!ctx) {
    throw new Error("useAyushCardForm must be used within AyushCardFormContext.Provider");
  }
  return ctx;
}
