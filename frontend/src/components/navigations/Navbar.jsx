import { NavLink } from "react-router-dom";
import Logo from "./Logo";

import { useWallet } from "../../hooks/useWallet";

export default function Navbar({ openWalletModal }) {
  const { wallet, setWallet } = useWallet();
  const walletConnected = wallet !== null;

  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "How It Works",
      path: "/how-it-works",
    },
  ];

  function handleDisconnect() {
    setWallet(null);
  }


  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Left */}
        <Logo />

        {/* Center */}
        {!walletConnected && (
          <div className="flex items-center gap-8">

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-emerald-600 underline underline-offset-5"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-4">

          {walletConnected && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {wallet.Address.slice(0, 8)}...
              {wallet.Address.slice(-6)}
            </span>
          )}

          {!walletConnected ? (
            <button
              onClick={openWalletModal}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Disconnect
            </button>
          )}

        </div>

      </div>

    </nav>
  );
}