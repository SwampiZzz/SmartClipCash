import { NavLink } from "react-router-dom";

export default function Sidebar({ links }) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col p-5">

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

      </div>
    </aside>
  );
}