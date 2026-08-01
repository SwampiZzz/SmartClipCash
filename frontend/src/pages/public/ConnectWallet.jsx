// frontend/src/pages/public/ConnectWallet.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import ConnectWalletModal from '../../components/modals/ConnectWalletModal';
import './ConnectWallet.css';

export default function ConnectWallet() {
  const { wallet } = useWallet();
  const [openRole, setOpenRole] = useState(null); // 'merchant' | 'customer' | null
  const navigate = useNavigate();

  function handleClose() {
    setOpenRole(null);
  }

  function handleConnected(role) {
    setOpenRole(null);
    navigate(role === 'merchant' ? '/merchant' : '/customer');
  }

  return (
    <div className="connect-wallet-page">
      <h1>Connect a wallet</h1>
      <p>Choose which side you're demoing. Both use a pasted chipnet WIF — this is a demo, not a real wallet integration.</p>

      <div className="connect-wallet-options">
        <button type="button" className="connect-option" onClick={() => setOpenRole('merchant')}>
          <strong>Business</strong>
          <span>Issue and redeem rewards</span>
        </button>
        <button type="button" className="connect-option" onClick={() => setOpenRole('customer')}>
          <strong>Customer</strong>
          <span>View your coupons and punch card</span>
        </button>
      </div>

      {wallet && (
        <p className="connect-wallet-current">
          Currently connected as {wallet.role} ({wallet.address}).
        </p>
      )}

      {openRole && (
        <ConnectWalletModal role={openRole} onClose={handleClose} onConnected={() => handleConnected(openRole)} />
      )}
    </div>
  );
}
