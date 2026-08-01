import { Outlet } from "react-router-dom";

import Navbar from "../components/navigations/Navbar.jsx";
import Sidebar from "../components/navigations/Sidebar.jsx";

const merchantLinks = [
  {
    label: "Dashboard",
    path: "/merchant/dashboard",
  },
  {
    label: "Manage Rewards",
    path: "/merchant/manage",
  },
  {
    label: "Scan & Redeem",
    path: "/merchant/scan",
  },
];

export default function MerchantLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="flex">

        <Sidebar links={merchantLinks} />

        <main className="flex-1 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}