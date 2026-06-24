import { useNavigate, useLocation } from "react-router-dom";
import {
  GitMerge,
  Search,
  LogOut,
  List,
  Activity,
  Wrench,
  Server,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";
import { CatalogSearch } from "../opensearch";
import logo from "../../assets/asklake-logo.png";

export function Sidebar({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const allNavItems = [
    { name: "데이터 카탈로그", path: "/catalog", icon: Activity },
    { name: "데이터 소스", path: "/sources", icon: Server, requiresDatasetEtlAccess: true },
    { name: "파이프라인 구축", path: "/dataset", icon: GitMerge, requiresDatasetEtlAccess: true },
    { name: "실행/모니터링", path: "/etl", icon: List, requiresDatasetEtlAccess: true },
    { name: "AI Query", path: "/query", icon: Search, requiresQueryAiAccess: true },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, requiresQueryAiAccess: true },
    { name: "사용자/권한", path: "/admin", icon: Wrench, adminOnly: true },
  ];

  // Filter items based on user permissions
  const navItems = allNavItems.filter((item) => {
    // Admin can see everything
    if (user?.is_admin === true) {
      return true;
    }

    // Admin-only items
    if (item.adminOnly) {
      return false;
    }

    // Dataset/ETL access control - check both user-level and role-level permissions
    if (item.requiresDatasetEtlAccess) {
      return user?.etl_access === true || user?.role_dataset_etl_access === true;
    }

    // Query/AI access control - check role-level permission
    if (item.requiresQueryAiAccess) {
      return user?.role_query_ai_access === true;
    }

    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={clsx(
        "h-screen bg-white border-r border-gray-200 text-gray-700 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className={clsx(
            "h-9 flex items-center shrink-0 transition-all duration-300",
            isCollapsed ? "w-10 overflow-hidden" : "w-36"
          )}>
            <img
              src={logo}
              alt="AskLake"
              className="h-9 w-auto max-w-none object-contain"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {navItems.map((item) => {
            const activePathGroups = {
              "/catalog": ["/catalog"],
              "/sources": ["/sources"],
              "/dataset": ["/dataset", "/source", "/target", "/etl/visual"],
              "/etl": ["/etl"],
              "/query": ["/query"],
              "/dashboard": ["/dashboard"],
              "/admin": ["/admin"],
            };
            const isActive = (activePathGroups[item.path] || [item.path]).some(
              (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
            );
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.name : ""}
                className={clsx(
                    "w-full min-w-0 flex items-center p-2 text-sm font-medium rounded-md transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {/* Icon container - fixed width */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <item.icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                </div>

                {/* Text label - fades out when collapsed */}
                <span
                  className={clsx(
                    "ml-3 min-w-0 truncate transition-all duration-300",
                    isCollapsed ? "opacity-0 w-0" : "opacity-100"
                  )}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-1">

        <button
          onClick={handleLogout}
          title={isCollapsed ? "로그아웃" : ""}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors w-full min-w-0 p-2 rounded-md hover:bg-red-50 relative overflow-hidden"
        >
          {/* Icon container - fixed width */}
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </div>

          {/* Text label - fades out when collapsed */}
          <span
            className={clsx(
              "ml-2 min-w-0 truncate transition-all duration-300",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            로그아웃
          </span>
        </button>
      </div>
    </div>
  );
}

export function Topbar({ isCollapsed }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  // Check if user has AI access - check role-level permission
  const hasAiAccess = user?.is_admin || user?.role_query_ai_access === true;

  return (
    <div
      className={clsx(
        "h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 sm:px-6 fixed top-0 right-0 z-[1000] transition-all duration-300 ease-in-out min-w-0",
        isCollapsed ? "left-20" : "left-64",
      )}
    >
      {/* Search */}
      <CatalogSearch />

      {/* Right Actions */}

      <div className="flex shrink-0 items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-700">{user?.name || "사용자"}</p>
          <p className="text-xs text-gray-500">{user?.is_admin ? "관리자" : "사용자"}</p>
        </div>
      </div>
    </div>
  );
}
