import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { logout } from "../../redux/slices/authSlice";
import { usePharmacyInventory } from "../../hooks/usePharmacyInventory";
import { summariseInventory } from "./inventoryUtils";

/*
  Pharmacy counterpart of components/layout/AppTopbar. Same chrome and the same
  theme/logout behaviour, but the search hits the medicine inventory instead of
  the patient directory and the bell points at stock alerts - a pharmacy has
  neither a hospital logo nor a patient list.

  Submitting the search lands on the inventory route with ?q=, which
  MedicineInventory reads, so a search from any pharmacy screen works.
*/

const PharmacyTopbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);

  const { data } = usePharmacyInventory();
  const { expired, expiring, low } = summariseInventory(data?.medicines ?? []);
  const alertCount = expired.length + expiring.length + low.length;

  const shopName = data?.pharmacy?.shopName;
  const ownerName = data?.pharmacy?.ownerName || user?.name;

  const handleSearch = (e) => {
    e.preventDefault();

    const term = query.trim();

    navigate(term ? `/pharmacy-dashboard/medicines?q=${encodeURIComponent(term)}` : "/pharmacy-dashboard/medicines");
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-lowest/90 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        {/* Brand - the sidebar is hidden below lg, same as the other shells */}
        <div className="flex items-center gap-3 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-on-primary">
            <User size={16} />
          </span>
          <span className="font-display text-title-card text-on-surface">mediReach</span>
        </div>

        {/* Inventory search */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines by name, batch or manufacturer"
            className="w-full rounded-control border border-outline-variant bg-surface-container py-2 pl-10 pr-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
          />
        </form>

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
            onClick={() => navigate("/pharmacy-dashboard/stock-alerts")}
            title="Stock alerts"
            className="relative rounded-control p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <AlertTriangle size={20} />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-error px-1 text-label-caps text-on-error tabular">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="ml-1 flex items-center gap-2 rounded-pill border border-outline-variant py-1 pl-1 pr-3 transition hover:bg-surface-container"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-primary-container/20 text-primary">
              <User size={16} />
            </span>
            <span className="hidden max-w-40 truncate text-body-md text-on-surface md:block">
              {shopName || ownerName || "Pharmacy"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-panel">
              <div className="border-b border-outline-variant px-4 py-3">
                <p className="truncate text-body-md text-on-surface">
                  {ownerName || "Pharmacy owner"}
                </p>
                <p className="truncate text-body-sm text-on-surface-variant">
                  {data?.pharmacy?.licenseNumber
                    ? `Licence ${data.pharmacy.licenseNumber}`
                    : "Pharmacy account"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-body-md text-on-surface transition hover:bg-error-container hover:text-on-error-container"
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

export default PharmacyTopbar;
