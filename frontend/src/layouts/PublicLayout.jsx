import { Outlet } from "react-router-dom";
import Navbar from "../components/navigations/Navbar";

export default function PublicLayout({ openWalletModal }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar openWalletModal={openWalletModal} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet context={{ openWalletModal }} />
      </main>
    </div>
  );
}
