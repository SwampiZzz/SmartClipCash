import { Outlet } from "react-router-dom";

import Sidebar from "../components/navigations/Sidebar";

const links = [
  {
    label: "Dashboard",
    path: "/merchant/dashboard",
    icon: "dashboard",
  },
  {
    label: "Manage Rewards",
    path: "/merchant/manage",
    icon: "rewards",
  },
  {
    label: "Scan & Redeem",
    path: "/merchant/scan",
    icon: "scan",
  },
];

export default function MerchantLayout() {
  return (
    <div className="flex h-screen bg-slate-50">

      {/* Fixed Sidebar */}
      <Sidebar links={links} />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

    </div>
  );
}