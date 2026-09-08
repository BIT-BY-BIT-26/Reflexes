import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Boxes, IndianRupee, Layers, Pill, Plus } from "lucide-react";
import PageHeader from "../layout/PageHeader";
import LiveClock from "../layout/LiveClock";
import StatsCard from "../Hospitals/StatsCard";
import { usePharmacyInventory } from "../../hooks/usePharmacyInventory";
import {
  EXPIRING_SOON_DAYS,
  LOW_STOCK_THRESHOLD,
  STATUS_CHIP,
  STATUS_LABEL,
  expiryPhrase,
  formatCurrency,
  formatDate,
  formatMonthYear,
  summariseInventory,
} from "../../features/pharmacy/inventoryUtils";

/*
  Pharmacy overview. Everything on this page comes from the one cached
  my-inventory query - the four headline figures reuse the same StatsCard the
  hospital dashboard uses, and the two panels below are derived from the same
  batch list by summariseInventory.
*/

const PharmacyDashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = usePharmacyInventory();

  const medicines = data?.medicines ?? [];
  const summary = summariseInventory(medicines);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-24 animate-pulse rounded-card bg-surface-container" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-card bg-surface-container" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-card bg-surface-container" />
          <div className="h-80 animate-pulse rounded-card bg-surface-container" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
        <span className="text-body-md text-on-error-container">Could not load inventory.</span>
        <button
          onClick={() => refetch()}
          className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const attention = summary.attention.slice(0, 6);
  const recent = summary.withStatus.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pharmacy"
        title="Inventory Overview"
        description={
          data?.pharmacy?.shopName
            ? `${data.pharmacy.shopName} — stock is tracked per batch, so one medicine appears once for each batch number.`
            : "Stock is tracked per batch, so one medicine appears once for each batch number."
        }
      >
        <LiveClock />

        <button
          onClick={() => navigate("/pharmacy-dashboard/add-medicine")}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
        >
          <Plus size={16} />
          Add medicine
        </button>
      </PageHeader>

      {/* Expired batches are the one thing that must not sit unnoticed. */}
      {summary.expired.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
          <span className="flex items-center gap-2 text-body-md text-on-error-container">
            <AlertTriangle size={18} className="flex-none" />
            {summary.expired.length} batch{summary.expired.length === 1 ? "" : "es"} past expiry are
            still on the shelf.
          </span>
          <Link
            to="/pharmacy-dashboard/stock-alerts"
            className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
          >
            Review alerts
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Medicines"
          count={summary.drugs}
          icon={Pill}
          route="/pharmacy-dashboard/medicines"
          bg="#00685f"
          options={[{ label: "add medicine", route: "/pharmacy-dashboard/add-medicine" }]}
        />

        <StatsCard
          title="Batches tracked"
          count={summary.batches}
          icon={Layers}
          route="/pharmacy-dashboard/medicines"
          bg="#006398"
        />

        <StatsCard
          title="Units in stock"
          count={summary.units.toLocaleString("en-IN")}
          icon={Boxes}
          route="/pharmacy-dashboard/medicines"
          bg="#4648d4"
        />

        <StatsCard
          title="Stock value"
          count={formatCurrency(summary.stockValue)}
          icon={IndianRupee}
          route="/pharmacy-dashboard/medicines"
          bg="#008378"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Needs attention */}
        <section className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest">
          <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
            <div>
              <h2 className="font-display text-headline-sm text-on-surface">Needs attention</h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Expired, expiring within {EXPIRING_SOON_DAYS} days, or {LOW_STOCK_THRESHOLD} units
                and under
              </p>
            </div>

            <Link
              to="/pharmacy-dashboard/stock-alerts"
              className="flex-none text-label-md font-medium text-primary transition hover:underline"
            >
              View all
            </Link>
          </header>

          {attention.length === 0 ? (
            <p className="px-5 py-12 text-center text-body-md text-on-surface-variant">
              Every batch is in date and well stocked.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {attention.map((medicine) => (
                <li key={medicine._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md text-on-surface">
                      {medicine.medicineName}
                      {medicine.strength && (
                        <span className="text-on-surface-variant"> · {medicine.strength}</span>
                      )}
                    </p>
                    <p className="truncate text-body-sm text-on-surface-variant">
                      Batch {medicine.batchNumber} · {expiryPhrase(medicine.daysLeft)}
                    </p>
                  </div>

                  <span className="flex-none text-body-md text-on-surface tabular">
                    {medicine.stock}
                  </span>

                  <span
                    className={`flex-none rounded-pill px-2.5 py-1 text-label-md font-medium ${
                      STATUS_CHIP[medicine.batchStatus]
                    }`}
                  >
                    {STATUS_LABEL[medicine.batchStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently added */}
        <section className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest">
          <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
            <div>
              <h2 className="font-display text-headline-sm text-on-surface">Recently added</h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Newest batches entered into the inventory
              </p>
            </div>

            <Link
              to="/pharmacy-dashboard/medicines"
              className="flex-none text-label-md font-medium text-primary transition hover:underline"
            >
              View all
            </Link>
          </header>

          {recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-body-md text-on-surface-variant">Nothing in inventory yet.</p>
              <button
                onClick={() => navigate("/pharmacy-dashboard/add-medicine")}
                className="mt-3 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
              >
                <Plus size={16} />
                Add your first medicine
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {recent.map((medicine) => (
                <li key={medicine._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md text-on-surface">
                      {medicine.medicineName}
                      {medicine.strength && (
                        <span className="text-on-surface-variant"> · {medicine.strength}</span>
                      )}
                    </p>
                    <p className="truncate text-body-sm text-on-surface-variant">
                      Added {formatDate(medicine.createdAt)} · expires{" "}
                      {formatMonthYear(medicine.expiryDate)}
                    </p>
                  </div>

                  <span className="flex-none rounded-pill bg-surface-container px-2.5 py-1 text-label-md font-medium text-on-surface-variant">
                    {medicine.addedVia === "OCR" ? "Scanned" : "Manual"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
