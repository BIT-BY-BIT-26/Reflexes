import { useState } from "react";
import { updateHospitalProfile } from "../../api/backend";
import PageHeader from "../../components/layout/PageHeader";

/*
  Hospital profile editor.

  Unchanged: the four sections and their completion checks, scrollToSection, the
  validate() rules, the gallery de-duplication by name+size+lastModified, every
  FormData key, the success alert and the field resets after a save.

  One deliberate change: the page-local dark-mode toggle is gone. It wrote the
  same "theme" localStorage key as the Redux themeSlice but only themed its own
  subtree, so inside the admin shell it fought the topbar's toggle. The global
  toggle governs this page now; persistence is unchanged.
*/

// Defined OUTSIDE the component so it's not recreated on every render —
// keeping it inside caused inputs to lose focus on every keystroke.
const Field = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-baseline gap-1 text-label-md text-on-surface-variant">
      {label}
      {required && <span className="text-primary">*</span>}
    </label>
    {children}
    {hint && <p className="text-body-sm text-on-surface-variant">{hint}</p>}
  </div>
);

const SECTIONS = [
  { id: "basics", label: "Basic Details" },
  { id: "hours", label: "Location & Hours" },
  { id: "facilities", label: "Facilities" },
  { id: "media", label: "Photos & Branding" },
];

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    description: "",
    address: "",
    facilities: "",
    timings: { open: "", close: "" },
  });

  const [logo, setLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);

  const sectionStatus = {
    basics: form.description.trim().length > 0,
    hours: Boolean(form.address.trim() && form.timings.open && form.timings.close),
    facilities: form.facilities.trim().length > 0,
    media: Boolean(logo || coverImage || galleryImages.length > 0),
  };
  const completedCount = Object.values(sectionStatus).filter(Boolean).length;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    if (!form.description.trim()) return "Description is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.timings.open || !form.timings.close)
      return "Opening and closing time are required";
    return "";
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setGalleryImages((prev) => {
      const combined = [...prev, ...newFiles];
      const seen = new Set();
      return combined.filter((f) => {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", form.description.trim());
      formData.append("address", form.address.trim());
      formData.append(
        "facilities",
        JSON.stringify(
          form.facilities.split(",").map((item) => item.trim()).filter(Boolean)
        )
      );
      formData.append("timings", JSON.stringify(form.timings));
      if (logo) formData.append("logo", logo);
      if (coverImage) formData.append("coverImage", coverImage);
      galleryImages.forEach((img) => formData.append("galleryImages", img));

      await updateHospitalProfile(formData);

      alert("Profile updated successfully");
      setForm({ description: "", address: "", facilities: "", timings: { open: "", close: "" } });
      setLogo(null);
      setCoverImage(null);
      setGalleryImages([]);
      setLogoPreview(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";

  const fileButtonClass =
    "w-full cursor-pointer text-body-sm text-on-surface-variant file:mr-3 file:cursor-pointer file:rounded-control file:border file:border-outline-variant file:bg-surface-container file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-on-surface hover:file:border-primary hover:file:text-primary";

  const sectionClass = "rounded-card border border-outline-variant bg-surface-lowest p-6";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital onboarding"
        title="Complete your hospital profile"
        description="This information appears on your public listing and unlocks your dashboard."
      >
        <div className="rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
          <span className="block text-label-caps uppercase text-on-surface-variant">
            Sections complete
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span className="font-display text-title-card text-on-surface tabular">
              {completedCount} / {SECTIONS.length}
            </span>
            <span className="h-1.5 w-24 overflow-hidden rounded-pill bg-surface-high">
              <span
                className="block h-full rounded-pill bg-primary transition-all duration-500"
                style={{ width: `${(completedCount / SECTIONS.length) * 100}%` }}
              />
            </span>
          </span>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Draft identity + section checklist */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-outline-variant bg-surface-lowest p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-card border border-outline-variant bg-surface-container">
                {logoPreview ? (
                  <img src={logoPreview} alt="Hospital logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-headline-sm text-on-surface-variant">H</span>
                )}
              </span>

              <div className="min-w-0">
                <p className="truncate text-body-md font-medium text-on-surface">
                  {form.address ? form.address.split(",")[0] : "Your hospital"}
                </p>
                <p className="text-body-sm text-on-surface-variant">Draft profile</p>
              </div>
            </div>

            <nav className="mt-5 flex flex-col gap-1">
              {SECTIONS.map((section) => {
                const done = sectionStatus[section.id];
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body-md text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border text-[9px] ${
                        done
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className={done ? "text-on-surface" : ""}>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <p className="mt-3 px-1 text-body-sm text-on-surface-variant">
            Fields marked <span className="text-primary">*</span> are required before you can
            publish your listing.
          </p>
        </aside>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-card border border-error/40 bg-error-container px-4 py-3 text-body-md text-on-error-container">
              {error}
            </div>
          )}

          {/* Basic Details */}
          <section id="basics" className={sectionClass}>
            <div className="mb-5 border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-sm text-on-surface">Basic details</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                A short, clear description helps patients understand what you offer.
              </p>
            </div>

            <Field label="Description" required>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                placeholder="e.g. A 200-bed multi-specialty hospital offering 24/7 emergency care, diagnostics, and surgical services."
              />
            </Field>
          </section>

          {/* Location & Hours */}
          <section id="hours" className={sectionClass}>
            <div className="mb-5 border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-sm text-on-surface">Location & hours</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Where patients can find you, and when you're open.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address" required>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={inputClass}
                    placeholder="Street, area, city, state, PIN code"
                  />
                </Field>
              </div>

              <Field label="Opening time" required>
                <input
                  type="time"
                  value={form.timings.open}
                  onChange={(e) =>
                    setForm({ ...form, timings: { ...form.timings, open: e.target.value } })
                  }
                  className={`${inputClass} tabular`}
                />
              </Field>

              <Field label="Closing time" required>
                <input
                  type="time"
                  value={form.timings.close}
                  onChange={(e) =>
                    setForm({ ...form, timings: { ...form.timings, close: e.target.value } })
                  }
                  className={`${inputClass} tabular`}
                />
              </Field>
            </div>
          </section>

          {/* Facilities */}
          <section id="facilities" className={sectionClass}>
            <div className="mb-5 border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-sm text-on-surface">Facilities</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                List what's available, separated by commas.
              </p>
            </div>

            <Field label="Facilities" hint="e.g. ICU, Pharmacy, Ambulance, Blood Bank">
              <input
                value={form.facilities}
                onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                className={inputClass}
                placeholder="ICU, Pharmacy, Ambulance"
              />
            </Field>

            {form.facilities.trim() && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.facilities
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean)
                  .map((f, i) => (
                    <span
                      key={`${f}-${i}`}
                      className="rounded-pill bg-secondary-container px-3 py-1 text-label-md font-medium text-on-secondary-container"
                    >
                      {f}
                    </span>
                  ))}
              </div>
            )}
          </section>

          {/* Media */}
          <section id="media" className={sectionClass}>
            <div className="mb-5 border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-sm text-on-surface">Photos & branding</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Your logo, a cover photo, and a few gallery images for your listing.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Logo">
                <input
                  type="file"
                  accept="image/*"
                  className={fileButtonClass}
                  onChange={handleLogoChange}
                />
                {logo && (
                  <p className="text-body-sm text-primary">Selected: {logo.name}</p>
                )}
              </Field>

              <Field label="Cover image">
                <input
                  type="file"
                  accept="image/*"
                  className={fileButtonClass}
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                />
                {coverImage && (
                  <p className="text-body-sm text-primary">Selected: {coverImage.name}</p>
                )}
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="Gallery images"
                hint="Select files multiple times to add more — they'll all be kept."
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className={fileButtonClass}
                  onChange={handleGalleryChange}
                />
              </Field>

              {galleryImages.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {galleryImages.map((img, index) => (
                    <div
                      key={`${img.name}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-control border border-outline-variant bg-surface-container px-3 py-2"
                    >
                      <span className="truncate text-body-sm text-on-surface">{img.name}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="shrink-0 text-body-sm font-medium text-error transition hover:brightness-110"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Submit bar */}
          <div className="flex items-center justify-between gap-4 rounded-card border border-outline-variant bg-surface-lowest px-6 py-4">
            <span className="text-body-md text-on-surface-variant tabular">
              {completedCount} of {SECTIONS.length} sections complete
            </span>

            <button
              type="submit"
              disabled={loading}
              className="rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
