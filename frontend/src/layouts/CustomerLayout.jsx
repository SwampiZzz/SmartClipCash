import { Outlet } from "react-router-dom";

import Sidebar from "../components/navigations/Sidebar";

const links = [
  {
    label: "Dashboard",
    path: "/customer/dashboard",
    icon: "dashboard",
  },
  {
    label: "My Rewards",
    path: "/customer/rewards",
    icon: "rewards",
  },
];

export default function CustomerLayout() {
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