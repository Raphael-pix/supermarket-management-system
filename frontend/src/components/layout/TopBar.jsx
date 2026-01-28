import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../utils/formatters";

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 my-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">
            Welcome back, {user?.firstName || "Admin"}!
          </h2>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">
              {user?.firstName || user?.lastName ? (
                <span>
                  {user?.firstName} {user?.lastName}{" "}
                </span>
              ) : (
                <span>Admin</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>

          {/* User Avatar and Dropdown */}
          <div className="relative group">
            <div className="w-10 h-10 bg-muted-foreground text-muted rounded-full flex items-center justify-center font-semibold cursor-pointer">
              {getInitials(user?.firstName, user?.lastName)}
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
