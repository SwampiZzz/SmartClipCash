// frontend/src/contexts/WalletContext.jsx
//
// Demo-only wallet state: holds whatever ConnectWalletModal collects
// (role, WIF, address) in memory for the session. Not a real wallet
// connection — a pasted WIF sitting in React state is visible to
// anything else running in this browser tab. Fine for a chipnet demo,
// not a pattern to carry forward.

import { createContext, useContext, useState, useMemo } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null); // { role: 'merchant' | 'customer', wif, address } | null

  const value = useMemo(() => ({
    wallet,
    setWallet,
    clearWallet: () => setWallet(null),
    isConnected: Boolean(wallet),
  }), [wallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return ctx;
}
