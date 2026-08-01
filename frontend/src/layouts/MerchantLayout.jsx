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
    <div className="flex min-h-dvh bg-slate-50 md:h-dvh">

      {/* Fixed Sidebar */}
      <Sidebar links={links} />

      {/* Scrollable Content */}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-6 md:p-8">
        <Outlet />
      </main>

    </div>
  );
}
