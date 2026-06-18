import { NavLink, Outlet } from "react-router-dom";
import type { UserProfile } from "../types";

interface Props {
  profile: UserProfile | null;
  onSignOut: () => void;
}

export function Layout({ profile, onSignOut }: Props) {
  const isGuardOrAdmin = profile?.role === "guard" || profile?.role === "admin";
  const isHostOrAdmin = profile?.role === "host" || profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-blue-600 text-lg">VMS</span>
          {isGuardOrAdmin && (
            <>
              <NavLink
                to="/checkin"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm hover:text-gray-900"
                }
              >
                Check In
              </NavLink>
              <NavLink
                to="/active"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm hover:text-gray-900"
                }
              >
                Active
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm hover:text-gray-900"
                }
              >
                History
              </NavLink>
            </>
          )}
          {isHostOrAdmin && (
            <NavLink
              to="/my-visitors"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm hover:text-gray-900"
              }
            >
              My Visitors
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{profile?.name}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs capitalize">{profile?.role}</span>
          <button onClick={onSignOut} className="text-gray-500 hover:text-red-600">
            Sign out
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
