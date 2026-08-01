import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  ScanLine,
  LogOut,
  User,
  Store,
} from "lucide-react";

import Logo from "./Logo";
import { useWallet } from "../../hooks/useWallet";

export default function Sidebar({ links }) {
  const { wallet, setWallet } = useWallet();
  const navigate = useNavigate();

  function handleDisconnect() {
    setWallet(null);
    navigate("/");
  }

  const icons = {
    dashboard: <LayoutDashboard size={20} />,
    rewards: <Gift size={20} />,
    scan: <ScanLine size={20} />,
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white shadow-lg md:static md:h-dvh md:w-72 md:shrink-0 md:flex-col md:border-r md:border-t-0 md:shadow-sm">

      {/* Logo */}
      <div className="hidden border-b border-slate-200 px-6 py-5 md:block">
        <Logo clickable={false} />
      </div>

      {/* Navigation */}
      <nav className="grid flex-1 grid-flow-col auto-cols-fr gap-1 p-2 md:block md:space-y-2 md:p-5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-[11px] font-medium transition md:min-h-0 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-left md:text-sm ${
                isActive
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {icons[link.icon]}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden border-t border-slate-200 p-5 md:block">

        {/* Wallet */}
        <div className="mb-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
              {wallet?.role === "merchant" ? (
                <Store size={20} className="text-emerald-600" />
              ) : (
                <User size={20} className="text-emerald-600" />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold">
                {wallet?.name}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {wallet?.role}
              </p>
            </div>

          </div>

          <div className="mt-4 rounded-xl bg-slate-100 p-3">

            <p className="text-xs text-slate-500">
              Connected Wallet
            </p>

            <p className="mt-1 truncate text-xs font-medium">
              {wallet?.address}
            </p>

          </div>

        </div>

        {/* Disconnect */}
        <button
          onClick={handleDisconnect}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Disconnect Wallet
        </button>

      </div>

    </aside>
  );
}
