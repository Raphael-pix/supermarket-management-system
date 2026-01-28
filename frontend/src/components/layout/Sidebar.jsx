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
    <div className="relative flex">
      <aside
        className={`${
          isOpen ? "w-64" : "w-0"
        } bg-white border-r border-border transition-all duration-300 overflow-hidden shrink-0 py-4 not-md:absolute not-md:inset-0 z-50`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SoftSpree</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto mt-6">
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
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
