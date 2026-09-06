/*
  Shared derivations for the pharmacy screens.

  Medicine is modelled per batch, so one drug shows up once per batchNumber.
  The dashboard, inventory table and stock alerts all classify a batch the same
  way, so that logic lives here rather than in three components.

  The schema has no reorderLevel field, so "low stock" is a fixed threshold.
  Expiry matches cron/MedicineExpiryCron.js: a batch is expired once expiryDate
  is before today's midnight, and the cron also flips status to "EXPIRED" and
  zeroes stock - a batch can therefore be expired by date before the nightly run
  has stamped it, which is why both are checked.
*/

export const LOW_STOCK_THRESHOLD = 10;
export const EXPIRING_SOON_DAYS = 90;

export const STATUS = {
  EXPIRED: "EXPIRED",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRING: "EXPIRING",
  LOW: "LOW",
  OK: "OK",
};

export const STATUS_LABEL = {
  [STATUS.EXPIRED]: "Expired",
  [STATUS.OUT_OF_STOCK]: "Out of stock",
  [STATUS.EXPIRING]: "Expiring soon",
  [STATUS.LOW]: "Low stock",
  [STATUS.OK]: "In stock",
};

/* Token-based chip classes, so the badges flip with the theme. */
export const STATUS_CHIP = {
  [STATUS.EXPIRED]: "bg-error-container text-on-error-container",
  [STATUS.OUT_OF_STOCK]: "bg-surface-highest text-on-surface-variant",
  [STATUS.EXPIRING]: "bg-warning-container text-on-warning-container",
  [STATUS.LOW]: "bg-warning-container text-on-warning-container",
  [STATUS.OK]: "bg-primary-container/20 text-primary",
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/* Whole days from today until the batch expires. Negative once it has passed. */
export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;

  expiry.setHours(0, 0, 0, 0);

  return Math.round((expiry - startOfToday()) / (1000 * 60 * 60 * 24));
};

export const getBatchStatus = (medicine) => {
  const days = daysUntilExpiry(medicine?.expiryDate);

  if (medicine?.status === "EXPIRED" || (days !== null && days < 0)) {
    return STATUS.EXPIRED;
  }

  const stock = Number(medicine?.stock) || 0;

  if (stock === 0) return STATUS.OUT_OF_STOCK;
  if (days !== null && days <= EXPIRING_SOON_DAYS) return STATUS.EXPIRING;
  if (stock <= LOW_STOCK_THRESHOLD) return STATUS.LOW;

  return STATUS.OK;
};

/*
  One pass over the batch list for everything the screens display.
  `attention` is what the dashboard and the alerts page both list: expired
  first, then nearest expiry, then thinnest stock.
*/
export const summariseInventory = (medicines = []) => {
  const withStatus = medicines.map((medicine) => ({
    ...medicine,
    batchStatus: getBatchStatus(medicine),
    daysLeft: daysUntilExpiry(medicine.expiryDate),
  }));

  const expired = withStatus.filter((m) => m.batchStatus === STATUS.EXPIRED);
  const expiring = withStatus.filter((m) => m.batchStatus === STATUS.EXPIRING);
  const low = withStatus.filter((m) => m.batchStatus === STATUS.LOW);
  const outOfStock = withStatus.filter((m) => m.batchStatus === STATUS.OUT_OF_STOCK);

  // Distinct drugs, not batches - name + strength is how the backend groups them.
  const distinctDrugs = new Set(
    withStatus.map((m) => `${m.medicineName || ""}|${m.strength || ""}`.toLowerCase())
  );

  const units = withStatus.reduce((total, m) => total + (Number(m.stock) || 0), 0);

  const stockValue = withStatus.reduce(
    (total, m) => total + (Number(m.price) || 0) * (Number(m.stock) || 0),
    0
  );

  const attention = [...expired, ...expiring, ...low, ...outOfStock].sort((a, b) => {
    if (a.batchStatus === STATUS.EXPIRED && b.batchStatus !== STATUS.EXPIRED) return -1;
    if (b.batchStatus === STATUS.EXPIRED && a.batchStatus !== STATUS.EXPIRED) return 1;

    if (a.daysLeft !== b.daysLeft) return (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9);

    return (Number(a.stock) || 0) - (Number(b.stock) || 0);
  });

  return {
    withStatus,
    expired,
    expiring,
    low,
    outOfStock,
    attention,
    batches: withStatus.length,
    drugs: distinctDrugs.size,
    units,
    stockValue,
  };
};

/* Dates are stored as the first of the expiry month (parseMonthYear on the server). */
export const formatMonthYear = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* "expires in 12 days" / "expired 5 days ago", for the alert rows. */
export const expiryPhrase = (daysLeft) => {
  if (daysLeft === null || daysLeft === undefined) return "No expiry recorded";
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago`;
  if (daysLeft === 0) return "Expires today";

  return `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
};
