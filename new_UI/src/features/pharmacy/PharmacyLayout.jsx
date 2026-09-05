import { Outlet } from "react-router-dom";
import { AlertTriangle, LayoutDashboard, Pill, PlusCircle } from "lucide-react";
import AppSidebar from "../../components/layout/AppSidebar";
import PharmacyTopbar from "./PharmacyTopbar";
import { usePharmacyInventory } from "../../hooks/usePharmacyInventory";
import { summariseInventory } from "./inventoryUtils";

/*
  Shell for /pharmacy-dashboard/*. Uses the same AppSidebar as the doctor and
  hospital shells; the topbar is pharmacy-specific because AppTopbar searches
  patients and loads a hospital logo, neither of which a pharmacy has.

  Only routes registered in AppRoutes are listed - the old sidebar linked to
  categories, orders, prescriptions, reports and settings, none of which exist.
*/

const navItems = [
  { to: "/pharmacy-dashboard", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/pharmacy-dashboard/medicines", label: "Inventory", icon: Pill },
  { to: "/pharmacy-dashboard/add-medicine", label: "Add medicine", icon: PlusCircle },
  { to: "/pharmacy-dashboard/stock-alerts", label: "Stock alerts", icon: AlertTriangle },
];

/*
  Shop identity plus the one figure worth seeing from every screen. Reads the
  cached inventory query the pages already use, so it costs no extra request.
*/
const PharmacySummary = () => {
  const { data, isLoading } = usePharmacyInventory();

  const pharmacy = data?.pharmacy;
  const { expired, expiring, low } = summariseInventory(data?.medicines ?? []);
  const alerts = expired.length + expiring.length + low.length;

  return (
    <>
      <p className="text-label-caps uppercase text-on-surface-variant">Pharmacy</p>
      <p className="mt-2 truncate font-display text-title-card text-on-surface">
        {pharmacy?.shopName || "Your pharmacy"}
      </p>
      <p className="mt-1 truncate text-body-sm text-on-surface-variant">
        {pharmacy?.city ? `${pharmacy.city}${pharmacy.state ? `, ${pharmacy.state}` : ""}` : "—"}
      </p>
      <p className="mt-2 text-body-sm text-on-surface-variant tabular">
        {isLoading
          ? "Loading inventory…"
          : alerts > 0
          ? `${alerts} batch${alerts === 1 ? "" : "es"} need attention`
          : "No stock alerts"}
      </p>
    </>
  );
};

const PharmacyLayout = () => {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <AppSidebar items={navItems} sectionLabel="Inventory" brandLabel="Pharmacy Portal">
        <PharmacySummary />
      </AppSidebar>

      <div className="lg:pl-64">
        <PharmacyTopbar />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
