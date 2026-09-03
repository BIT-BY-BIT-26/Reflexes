import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Stethoscope } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

/*
  Left rail shared by the doctor and hospital-admin shells.

  `items` lists only routes that actually exist in AppRoutes. `children` is the
  contextual block under the brand - OPD session state for a doctor, hospital
  identity for an admin.

  Logout dispatches the same authSlice action the old Navbar did and lands on
  /login, unchanged.
*/

const AppSidebar = ({ items, sectionLabel = "Workspace", children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-outline-variant bg-surface-lowest lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-card bg-primary text-on-primary">
          <Stethoscope size={18} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-title-card text-on-surface">
            mediReach
          </span>
          <span className="block text-label-caps uppercase text-on-surface-variant">
            Clinical Portal
          </span>
        </span>
      </div>

      {/* Contextual block */}
      {children && <div className="border-b border-outline-variant px-5 py-4">{children}</div>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-label-caps uppercase text-on-surface-variant">
          {sectionLabel}
        </p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-control px-3 py-2.5 text-body-md transition",
                      isActive
                        ? "bg-primary-container/15 font-medium text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.showUnread && unreadCount > 0 && (
                    <span className="rounded-pill bg-error px-2 py-0.5 text-label-caps text-on-error tabular">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-outline-variant p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-body-md text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
