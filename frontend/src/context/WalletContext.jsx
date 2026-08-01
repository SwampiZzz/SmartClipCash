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
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("transactionHistory") ?? "[]");
    } catch {
      return [];
    }
  });

  function refreshWalletData() {
    setRefreshKey((current) => current + 1);
  }

  function recordTransaction(transaction) {
    setTransactionHistory((history) => [
      { ...transaction, createdAt: new Date().toISOString() },
      ...history,
    ].slice(0, 25));
  }

  // Keep localStorage synchronized with wallet state
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
    } else {
      localStorage.removeItem("wallet");
    }
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
  }, [transactionHistory]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        refreshKey,
        refreshWalletData,
        transactionHistory,
        recordTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
