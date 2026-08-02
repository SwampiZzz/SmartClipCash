import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const WalletContext = createContext(null);

const TRANSACTION_HISTORY_KEY = "transactionHistoryByWallet";

function getHistoryKey(wallet) {
  return wallet?.address?.toLowerCase() ?? null;
}

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
  const [transactionHistoryByWallet, setTransactionHistoryByWallet] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TRANSACTION_HISTORY_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  const transactionHistory = transactionHistoryByWallet[getHistoryKey(wallet)] ?? [];

  function refreshWalletData() {
    setRefreshKey((current) => current + 1);
  }

  function recordTransaction(transaction) {
    const historyKey = getHistoryKey(wallet);
    if (!historyKey) return;

    setTransactionHistoryByWallet((historyByWallet) => ({
      ...historyByWallet,
      [historyKey]: [
        { ...transaction, createdAt: new Date().toISOString() },
        ...(historyByWallet[historyKey] ?? []),
      ].slice(0, 25),
    }));
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
    localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(transactionHistoryByWallet));
  }, [transactionHistoryByWallet]);

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
