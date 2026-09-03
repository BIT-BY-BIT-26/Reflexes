import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Moon, Search, Settings, Sun, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getHospitalProfile, searchPatient } from "../../api/backend";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { logout } from "../../redux/slices/authSlice";
import { ROLE } from "../../constants/Role";

/*
  Top bar shared by the doctor and hospital-admin shells.

  Every behaviour here is carried over from components/Navbar.jsx unchanged:
    - hospital logo fetched once on mount, errors swallowed
    - patient search debounced 500ms against GET /search-patients
    - result click navigates to `${basePath}/patients/:id` (basePath by role)
    - theme toggle dispatches toggleTheme
    - bell navigates to the doctor notifications route, badge from the
      notification slice
    - the settings button has no handler in the old Navbar either
    - "See Profile" / "Complete Profile" keep their original destinations
    - logout dispatches logout() then navigates to /login
*/

const AppTopbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [logo, setLogo] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const mode = useSelector((state) => state.theme.mode);
  const role = useSelector((state) => state.auth.role);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const basePath = role === ROLE.doctor ? "/doctor-dashboard" : "/hospital-dashboard";

  useEffect(() => {
    const getLogo = async () => {
      try {
        const res = await getHospitalProfile();
        setLogo(res.data.data.logo);
      } catch (error) {
        console.log(`error occured ${error}`);
      }
    };

    getLogo();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const res = await searchPatient(query.trim());

        setSearchResults(res.data.patients || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Patient search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = () => {
    navigate("/doctor-dashboard/notifications");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-lowest/90 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        {/* Hospital mark - shown once the profile call returns */}
        <div className="flex items-center gap-3 lg:hidden">
          {logo ? (
            <img src={logo} alt="" className="h-8 w-8 rounded-control object-cover" />
          ) : (
            <span className="h-8 w-8 rounded-control bg-primary-container/20" />
          )}
          <span className="font-display text-title-card text-on-surface">mediReach</span>
        </div>

        {/* Patient search */}
        <div className="relative w-full max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name, email or phone"
            className="w-full rounded-control border border-outline-variant bg-surface-container py-2 pl-10 pr-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
          />

          {showSearchResults && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-card border border-outline-variant bg-surface-lowest shadow-panel">
              {searchLoading ? (
                <p className="px-4 py-3 text-body-sm text-on-surface-variant">Searching…</p>
              ) : searchResults.length === 0 ? (
                <p className="px-4 py-3 text-body-sm text-on-surface-variant">
                  No patients matched “{query}”.
                </p>
              ) : (
                searchResults.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => {
                      setQuery("");
                      setShowSearchResults(false);
                      navigate(`${basePath}/patients/${patient._id}`);
                    }}
                    className="flex w-full items-center gap-3 border-b border-outline-variant/60 px-4 py-3 text-left transition last:border-b-0 hover:bg-surface-container"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-secondary-container text-on-secondary-container">
                      <User size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-body-md text-on-surface">
                        {patient.userId?.name || "Unnamed patient"}
                      </span>
                      <span className="block truncate text-body-sm text-on-surface-variant">
                        {patient.userId?.email || "No email"} ·{" "}
                        {patient.phone_number || patient.userId?.phone_number || "No phone"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative ml-auto flex items-center gap-1">
          <button
            onClick={() => dispatch(toggleTheme())}
            title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-control p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={handleNotificationClick}
            className="relative rounded-control p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-error px-1 text-label-caps text-on-error tabular">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button className="rounded-control p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface">
            <Settings size={20} />
          </button>

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="ml-1 flex items-center gap-2 rounded-pill border border-outline-variant py-1 pl-1 pr-3 transition hover:bg-surface-container"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-primary-container/20 text-primary">
              <User size={16} />
            </span>
            <span className="hidden text-body-md text-on-surface md:block">
              {role === ROLE.doctor ? "Doctor" : "Admin"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-panel">
              <button
                onClick={() => {
                  navigate("/hospital-dashboard/hospital-profile");
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-body-md text-on-surface transition hover:bg-surface-container"
              >
                <User size={16} />
                See Profile
              </button>

              <button
                onClick={() => {
                  navigate("/hospital-dashboard/profile");
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-body-md text-on-surface transition hover:bg-surface-container"
              >
                <Settings size={16} />
                Complete Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-outline-variant px-4 py-3 text-left text-body-md text-on-surface transition hover:bg-error-container hover:text-on-error-container"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppTopbar;
