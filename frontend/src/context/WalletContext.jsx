/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);

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
