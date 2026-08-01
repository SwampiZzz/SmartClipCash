import { NavLink } from "react-router-dom";
import Logo from "./Logo";

import { useWallet } from "../../hooks/useWallet";

export default function Navbar({ openWalletModal }) {
  const { wallet } = useWallet();

  const walletConnected = wallet !== null;

  // Hide the navbar completely once a wallet is connected
  if (walletConnected) return null;

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

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

        {/* Left */}
        <Logo clickable={true} />

        {/* Center */}
        <div className="flex items-center gap-3 sm:gap-8">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `whitespace-nowrap text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "text-emerald-600 underline underline-offset-4"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <button
          onClick={openWalletModal}
          className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-5"
        >
          Connect Wallet
        </button>

      </div>

    </nav>
  );
}
