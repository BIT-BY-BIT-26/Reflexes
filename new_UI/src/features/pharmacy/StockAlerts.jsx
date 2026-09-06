import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarClock, CheckCircle2, PackageX, TrendingDown } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { usePharmacyInventory } from "../../hooks/usePharmacyInventory";
import {
  EXPIRING_SOON_DAYS,
  LOW_STOCK_THRESHOLD,
  expiryPhrase,
  formatMonthYear,
  summariseInventory,
} from "./inventoryUtils";

/*
  The three things that need a pharmacist to act, grouped so each can be worked
  through in turn. Same batch list as the inventory table, classified by
  summariseInventory - nothing is computed twice differently.
*/

const AlertGroup = ({ title, description, icon: Icon, tone, items, emptyText }) => (
  <section className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest">
    <header className="flex items-start gap-3 border-b border-outline-variant px-5 py-4">
      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-control ${tone}`}>
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{description}</p>
      </div>

      <span className="flex-none font-display text-headline-md text-on-surface tabular">
        {items.length}
      </span>
    </header>

    {items.length === 0 ? (
      <p className="flex items-center justify-center gap-2 px-5 py-10 text-body-md text-on-surface-variant">
        <CheckCircle2 size={16} className="text-primary" />
        {emptyText}
      </p>
    ) : (
      <ul className="divide-y divide-outline-variant/60">
        {items.map((medicine) => (
          <li key={medicine._id} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-on-surface">
                {medicine.medicineName}
                {medicine.strength && (
                  <span className="text-on-surface-variant"> · {medicine.strength}</span>
                )}
              </p>
              <p className="truncate text-body-sm text-on-surface-variant">
                Batch {medicine.batchNumber} · {formatMonthYear(medicine.expiryDate)} ·{" "}
                {expiryPhrase(medicine.daysLeft)}
              </p>
            </div>

            <span className="flex-none text-right">
              <span className="block text-body-md text-on-surface tabular">{medicine.stock}</span>
              <span className="block text-label-caps uppercase text-on-surface-variant">units</span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

const StockAlerts = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = usePharmacyInventory();

  const summary = summariseInventory(data?.medicines ?? []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-card bg-surface-container" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-card bg-surface-container" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
        <span className="text-body-md text-on-error-container">Could not load stock alerts.</span>
        <button
          onClick={() => refetch()}
          className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const total = summary.expired.length + summary.expiring.length + summary.low.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pharmacy"
        title="Stock Alerts"
        description={
          total === 0
            ? "Nothing needs attention right now."
            : `${total} batch${total === 1 ? "" : "es"} need attention across expiry and stock levels.`
        }
      >
        <button
          onClick={() => navigate("/pharmacy-dashboard/medicines")}
          className="inline-flex items-center gap-2 rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
        >
          Open inventory
        </button>
      </PageHeader>

      <AlertGroup
        title="Expired"
        description="Past expiry — the nightly job zeroes stock, remove these from the shelf"
        icon={AlertTriangle}
        tone="bg-error-container text-on-error-container"
        items={summary.expired}
        emptyText="No expired batches."
      />

      <AlertGroup
        title="Expiring soon"
        description={`Expiring within ${EXPIRING_SOON_DAYS} days`}
        icon={CalendarClock}
        tone="bg-warning-container text-on-warning-container"
        items={summary.expiring}
        emptyText={`Nothing expires in the next ${EXPIRING_SOON_DAYS} days.`}
      />

      <AlertGroup
        title="Low stock"
        description={`${LOW_STOCK_THRESHOLD} units or fewer left in the batch`}
        icon={TrendingDown}
        tone="bg-warning-container text-on-warning-container"
        items={summary.low}
        emptyText="Every in-date batch is well stocked."
      />

      <AlertGroup
        title="Out of stock"
        description="In date, but nothing left to dispense"
        icon={PackageX}
        tone="bg-surface-highest text-on-surface-variant"
        items={summary.outOfStock}
        emptyText="No empty batches."
      />
    </div>
  );
};

export default StockAlerts;
