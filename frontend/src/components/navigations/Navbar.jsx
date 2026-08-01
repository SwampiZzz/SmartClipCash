import { NavLink } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar({
  walletConnected,
  walletAddress,
  onConnect,
  onDisconnect,
}) {
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
                      ? "text-blue-600"
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
              {walletAddress.slice(0, 8)}...
              {walletAddress.slice(-6)}
            </span>
          )}

          {!walletConnected ? (
            <button
              onClick={onConnect}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={onDisconnect}
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