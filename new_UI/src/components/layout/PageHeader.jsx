/*
  Shared page header for the doctor screens: eyebrow, title, one line of
  context, and an optional right-hand slot for meta or actions.
  Presentational only.
*/

const PageHeader = ({ eyebrow, title, description, children }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-label-caps uppercase text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-headline-lg text-balance text-on-surface">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">{description}</p>
        )}
      </div>

      {children && <div className="flex flex-none flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
};

export default PageHeader;
