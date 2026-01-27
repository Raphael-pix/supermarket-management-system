import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  Store,
} from "lucide-react";

const Sidebar = ({ isOpen }) => {
  const navItems = [
    {
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/admin/inventory",
      icon: Package,
      label: "Inventory",
    },
    {
      to: "/admin/sales",
      icon: TrendingUp,
      label: "Sales Reports",
    },
    {
      to: "/admin/users",
      icon: Users,
      label: "Users",
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Supermarket</h1>
              <p className="text-xs text-slate-500">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            <p className="font-medium">v1.0.0</p>
            <p className="mt-1">© 2025 Supermarket Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
