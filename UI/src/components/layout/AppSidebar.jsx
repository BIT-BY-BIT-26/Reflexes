import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Stethoscope } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

/*
  Sliding left rail shared by the dashboard shells.

  Always mounted: it slides in and out with translate-x below `lg` and is
  pinned open from `lg` up, so the same markup serves the mobile drawer and the
  desktop sidebar. `open` / `onClose` are owned by the layout that renders it.

  `items` must only list routes that exist in AppRoutes - a link to a
  role-gated route bounces through protectedRoutes and looks like a dead button.
*/

const AppSidebar = ({
  items,
  open,
  onClose,
  sectionLabel = "Workspace",
  brandLabel = "Clinical Portal",
  children,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
    }`;

  return (
    <>
      {/* Backdrop - mobile only, closes the drawer */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Stethoscope size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900 dark:text-white">
              mediReach
            </p>
            <p className="truncate text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">
              {brandLabel}
            </p>
          </div>
        </div>

        {/* Contextual block */}
        {children && (
          <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-800">
            {children}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            {sectionLabel}
          </p>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={linkClass}
                >
                  <Icon size={19} />
                  <span className="flex-1">{item.label}</span>

                  {item.showUnread && unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/20 dark:hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
