import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

/*
  One overview metric. Same props, same navigation targets, same kebab menu
  behaviour (opens on click, closes on mouse leave or after navigating).
  `bg` is still accepted and still tints the icon chip.
*/

export default function StatsCard({ title, count, bg, icon: Icon, route, options }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const handleToggleMenu = async () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="relative flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            style={{ backgroundColor: bg }}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-control text-white"
          >
            <Icon size={20} />
          </span>

          <div className="min-w-0">
            <p className="text-label-caps uppercase text-on-surface-variant">{title}</p>
            <p className="mt-1 font-display text-headline-lg text-on-surface tabular">{count}</p>
          </div>
        </div>

        {options?.length > 0 && (
          <div className="relative flex-none">
            <button
              onClick={handleToggleMenu}
              className="rounded-control p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
            >
              <MoreVertical size={18} />
            </button>

            {openMenu && (
              <div
                onMouseLeave={() => setOpenMenu(false)}
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-panel"
              >
                {options?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.route); // 🔥 NAVIGATE HERE
                      setOpenMenu(false);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-body-md capitalize text-on-surface transition hover:bg-surface-container"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(route)}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-label-md font-medium text-primary transition hover:gap-2.5"
      >
        View all →
      </button>
    </div>
  );
}
