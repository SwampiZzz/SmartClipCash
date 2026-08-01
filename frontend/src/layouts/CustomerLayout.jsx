import { Outlet } from "react-router-dom";

import Navbar from "../components/navigations/Navbar.jsx";
import Sidebar from "../components/navigations/Sidebar.jsx";

const customerLinks = [
  {
    label: "Dashboard",
    path: "/customer/dashboard",
  },
  {
    label: "My Rewards",
    path: "/customer/rewards",
  },
];

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="flex">

        <Sidebar links={customerLinks} />

        <main className="flex-1 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}