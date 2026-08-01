import { Outlet } from "react-router-dom";

import Navbar from "../components/navigations/Navbar.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>

    </div>
  );
}