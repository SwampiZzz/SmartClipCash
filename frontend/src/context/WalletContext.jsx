import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const WalletContext = createContext(null);

export function WalletProvider({ children }) {

  // Load saved wallet once on app startup
  const [wallet, setWallet] = useState(() => {
    const savedWallet = localStorage.getItem("wallet");

    if (!savedWallet) return null;

    try {
      return JSON.parse(savedWallet);
    } catch {
      return null;
    }
  });

  // Keep localStorage synchronized with wallet state
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
    } else {
      localStorage.removeItem("wallet");
    }
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}