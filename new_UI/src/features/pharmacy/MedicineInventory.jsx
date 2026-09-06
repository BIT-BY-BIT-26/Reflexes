import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { usePharmacyInventory } from "../../hooks/usePharmacyInventory";
import {
  STATUS,
  STATUS_CHIP,
  STATUS_LABEL,
  formatCurrency,
  formatMonthYear,
  summariseInventory,
} from "./inventoryUtils";

/*
  Full batch list. One row per batch document, because that is how Medicine is
  modelled - the same drug appears once per batchNumber.

  The search term comes from ?q= so the topbar search can land here from any
  pharmacy screen; typing in the field keeps the URL in sync.
*/

const filters = [
  { key: "ALL", label: "All" },
  { key: STATUS.OK, label: "In stock" },
  { key: STATUS.LOW, label: "Low stock" },
  { key: STATUS.EXPIRING, label: "Expiring soon" },
  { key: STATUS.EXPIRED, label: "Expired" },
  { key: STATUS.OUT_OF_STOCK, label: "Out of stock" },
];

const MedicineInventory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState("ALL");

  const query = searchParams.get("q") ?? "";

  const { data, isLoading, isError, refetch } = usePharmacyInventory();

  const summary = summariseInventory(data?.medicines ?? []);

  const setQuery = (value) => {
    // replace: typing shouldn't stack history entries
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  const counts = useMemo(
    () => ({
      ALL: summary.withStatus.length,
      [STATUS.OK]: summary.withStatus.filter((m) => m.batchStatus === STATUS.OK).length,
      [STATUS.LOW]: summary.low.length,
      [STATUS.EXPIRING]: summary.expiring.length,
      [STATUS.EXPIRED]: summary.expired.length,
      [STATUS.OUT_OF_STOCK]: summary.outOfStock.length,
    }),
    [summary]
  );

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();

    return summary.withStatus.filter((medicine) => {
      if (status !== "ALL" && medicine.batchStatus !== status) return false;
      if (!term) return true;

      return [
        medicine.medicineName,
        medicine.strength,
        medicine.batchNumber,
        medicine.manufacturer,
        medicine.category,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [summary, status, query]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-card bg-surface-container" />
        <div className="h-96 animate-pulse rounded-card bg-surface-container" />
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pharmacy"
        title="Medicine Inventory"
        description={`${summary.batches} batch${summary.batches === 1 ? "" : "es"} across ${
          summary.drugs
        } medicine${summary.drugs === 1 ? "" : "s"} · ${formatCurrency(
          summary.stockValue
        )} at current prices`}
      >
        <button
          onClick={() => navigate("/pharmacy-dashboard/add-medicine")}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
        >
          <Plus size={16} />
          Add medicine
        </button>
      </PageHeader>

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, batch, manufacturer or category"
            className="w-full rounded-control border border-outline-variant bg-surface-lowest py-2 pl-10 pr-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatus(filter.key)}
              className={`rounded-pill border px-3 py-1.5 text-label-md font-medium transition ${
                status === filter.key
                  ? "border-primary bg-primary-container/15 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {filter.label}
              <span className="ml-1.5 tabular">{counts[filter.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-display text-headline-sm text-on-surface">
            {summary.batches === 0 ? "No medicines yet" : "Nothing matches this filter"}
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {summary.batches === 0
              ? "Add a medicine to start tracking stock and expiry."
              : "Try a different search term or status."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-lowest">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-5 py-3 text-label-caps uppercase text-on-surface-variant">
                  Medicine
                </th>
                <th className="px-5 py-3 text-label-caps uppercase text-on-surface-variant">
                  Batch
                </th>
                <th className="px-5 py-3 text-label-caps uppercase text-on-surface-variant">
                  Expiry
                </th>
                <th className="px-5 py-3 text-right text-label-caps uppercase text-on-surface-variant">
                  Stock
                </th>
                <th className="px-5 py-3 text-right text-label-caps uppercase text-on-surface-variant">
                  Price
                </th>
                <th className="px-5 py-3 text-right text-label-caps uppercase text-on-surface-variant">
                  Value
                </th>
                <th className="px-5 py-3 text-label-caps uppercase text-on-surface-variant">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/60">
              {rows.map((medicine) => (
                <tr key={medicine._id} className="transition hover:bg-surface-container/60">
                  <td className="px-5 py-3">
                    <p className="text-body-md text-on-surface">
                      {medicine.medicineName}
                      {medicine.strength && (
                        <span className="text-on-surface-variant"> · {medicine.strength}</span>
                      )}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {medicine.manufacturer || "Manufacturer not recorded"}
                      {medicine.category ? ` · ${medicine.category}` : ""}
                    </p>
                  </td>

                  <td className="px-5 py-3 text-body-md text-on-surface-variant">
                    {medicine.batchNumber}
                  </td>

                  <td className="px-5 py-3 text-body-md text-on-surface tabular">
                    {formatMonthYear(medicine.expiryDate)}
                  </td>

                  <td className="px-5 py-3 text-right text-body-md text-on-surface tabular">
                    {medicine.stock}
                  </td>

                  <td className="px-5 py-3 text-right text-body-md text-on-surface tabular">
                    {formatCurrency(medicine.price)}
                  </td>

                  <td className="px-5 py-3 text-right text-body-md text-on-surface tabular">
                    {formatCurrency((Number(medicine.price) || 0) * (Number(medicine.stock) || 0))}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-pill px-2.5 py-1 text-label-md font-medium ${
                        STATUS_CHIP[medicine.batchStatus]
                      }`}
                    >
                      {STATUS_LABEL[medicine.batchStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicineInventory;
