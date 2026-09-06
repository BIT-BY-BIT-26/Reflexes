# Builds a static preview of the redesigned doctor OPD screens.
# The CSS is the real compiled Tailwind bundle from `npm run build`, and the
# markup mirrors the JSX class-for-class, so what renders here is what the
# components render.

import glob
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
css_path = sorted(glob.glob(os.path.join(ROOT, "new_UI", "dist", "assets", "index-*.css")))[0]
css = io.open(css_path, encoding="utf-8").read()

ICON = {
    "stethoscope": "M6 3v5a6 6 0 0 0 12 0V3M6 3H4m2 0h2m10 0h-2m2 0h2M12 14v3a4 4 0 0 0 8 0v-1m0-2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
    "grid": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    "calendar": "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    "bell": "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
    "logout": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    "search": "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
    "moon": "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
    "sun": "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    "settings": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.62.75 1.06 1.4 1.09H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
    "user": "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "activity": "M22 12h-4l-3 9L9 3l-3 9H2",
    "check": "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14.1l-3-3",
    "shield": "M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.4 0C14.4 3.8 17 5 19 5a1 1 0 0 1 1 1ZM9 12l2 2 4-4",
    "clock": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
    "userplus": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6",
    "users": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    "power": "M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0",
    "pause": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM10 9v6M14 9v6",
    "play": "m5 3 14 9-14 9V3Z",
    "eye": "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "phone": "M13 2a9 9 0 0 1 9 9M13 6a5 5 0 0 1 5 5M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
    "pill": "M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7ZM8.5 8.5l7 7",
    "hourglass": "M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2c0 .5.2 1 .6 1.4L12 12l4.4-4.4c.4-.4.6-.9.6-1.4V2",
    "userround": "M18 20a6 6 0 0 0-12 0M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "share": "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    "pencil": "M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",
    "camera": "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "droplet": "M12 2.7 6.7 8a7.5 7.5 0 1 0 10.6 0Z",
    "domain": "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
    "dots": "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
}


def icon(name, size=18, cls=""):
    return (
        f'<svg class="{cls}" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
        f'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
        f'aria-hidden="true"><path d="{ICON[name]}"/></svg>'
    )


DOCTOR_NAV = [
    ("grid", "OPD Console", "console"),
    ("calendar", "Today's Appointments", "appointments"),
    ("bell", "Notifications", "notifications"),
]

ADMIN_NAV = [
    ("grid", "Overview", "overview"),
    ("domain", "Departments", "departments"),
    ("stethoscope", "Doctors", "doctors"),
    ("userround", "Hospital profile", "hospital-profile"),
    ("settings", "Edit profile", "edit-profile"),
]


def sidebar(active, opd_state, nav=None, section="Clinical suite"):
    items = [(ic, label, active == key) for ic, label, key in (nav or DOCTOR_NAV)]
    nav = ""
    for ic, label, is_active in items:
        cls = (
            "bg-primary-container/15 font-medium text-primary"
            if is_active
            else "text-on-surface-variant"
        )
        badge = (
            '<span class="rounded-pill bg-error px-2 py-0.5 text-label-caps text-on-error tabular">3</span>'
            if label == "Notifications"
            else ""
        )
        nav += f"""
          <li><span class="flex items-center gap-3 rounded-control px-3 py-2.5 text-body-md {cls}">
            {icon(ic)}<span class="flex-1">{label}</span>{badge}
          </span></li>"""

    if opd_state == "live":
        heading, tone, label, sub = "Session", "text-primary", "OPD live", "4 waiting in queue"
    elif opd_state == "admin":
        heading, tone, label, sub = "Hospital", "text-on-surface", "Administration", "6 departments · 24 doctors"
    else:
        heading, tone, label, sub = "Session", "text-on-surface-variant", "OPD closed", "Start OPD to open the queue"

    context_icon = icon("domain", 16) if opd_state == "admin" else icon("activity", 16)

    return f"""
      <aside class="flex w-64 flex-none flex-col border-r border-outline-variant bg-surface-lowest">
        <div class="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
          <span class="flex h-9 w-9 items-center justify-center rounded-card bg-primary text-on-primary">{icon('stethoscope')}</span>
          <span class="min-w-0">
            <span class="block truncate font-display text-title-card text-on-surface">mediReach</span>
            <span class="block text-label-caps uppercase text-on-surface-variant">Clinical Portal</span>
          </span>
        </div>
        <div class="border-b border-outline-variant px-5 py-4">
          <p class="text-label-caps uppercase text-on-surface-variant">{heading}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="flex items-center gap-2 font-display text-title-card {tone}">{context_icon}{label}</span>
          </div>
          <p class="mt-1 text-body-sm text-on-surface-variant tabular">{sub}</p>
        </div>
        <nav class="flex-1 px-3 py-4">
          <p class="px-2 pb-2 text-label-caps uppercase text-on-surface-variant">{section}</p>
          <ul class="flex flex-col gap-1">{nav}</ul>
        </nav>
        <div class="border-t border-outline-variant p-3">
          <span class="flex items-center gap-3 rounded-control px-3 py-2.5 text-body-md text-on-surface-variant">{icon('logout')}Log out</span>
        </div>
      </aside>"""


def topbar(theme):
    toggle = icon("sun") if theme == "dark" else icon("moon")
    return f"""
      <header class="border-b border-outline-variant bg-surface-lowest">
        <div class="flex items-center gap-4 px-6 py-3">
          <div class="relative w-full max-w-md">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">{icon('search',17)}</span>
            <span class="block w-full rounded-control border border-outline-variant bg-surface-container py-2 pl-10 pr-3 text-body-md text-on-surface-variant">Search patients by name, email or phone</span>
          </div>
          <div class="ml-auto flex items-center gap-1">
            <span class="rounded-control p-2 text-on-surface-variant">{toggle}</span>
            <span class="relative rounded-control p-2 text-on-surface-variant">{icon('bell',20)}
              <span class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-error px-1 text-label-caps text-on-error tabular">3</span>
            </span>
            <span class="rounded-control p-2 text-on-surface-variant">{icon('settings',20)}</span>
            <span class="ml-1 flex items-center gap-2 rounded-pill border border-outline-variant py-1 pl-1 pr-3">
              <span class="flex h-7 w-7 items-center justify-center rounded-pill bg-primary-container/20 text-primary">{icon('user',16)}</span>
              <span class="text-body-md text-on-surface">Doctor</span>
            </span>
          </div>
        </div>
      </header>"""


def page_header(title, description, right):
    return f"""
      <div class="flex flex-col gap-4 border-b border-outline-variant pb-5 md:flex-row md:items-end md:justify-between">
        <div class="min-w-0">
          <p class="text-label-caps uppercase text-primary">Doctor portal</p>
          <h1 class="mt-1 font-display text-headline-lg text-on-surface">{title}</h1>
          <p class="mt-2 max-w-2xl text-body-md text-on-surface-variant">{description}</p>
        </div>
        <div class="flex flex-none flex-wrap items-center gap-3">{right}</div>
      </div>"""


SHIFT_CLOCK = f"""
      <div class="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-control bg-primary-container/20 text-primary">{icon('calendar')}</span>
        <span>
          <span class="block text-body-md text-on-surface">Thursday, 03 September 2026</span>
          <span class="block text-body-sm text-on-surface-variant tabular">10:24:07</span>
        </span>
      </div>"""


def stat_tile(label, value, ic, tone, link=False):
    cta = (
        '<button class="mt-3 inline-flex items-center gap-1.5 self-start text-label-md font-medium text-primary">View details <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>'
        if link
        else ""
    )
    return f"""
        <div class="flex flex-col justify-between rounded-card border border-outline-variant bg-surface-lowest p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-label-caps uppercase text-on-surface-variant">{label}</p>
              <p class="mt-2 font-display text-headline-lg text-on-surface tabular">{value}</p>
            </div>
            <span class="flex-none {tone}">{icon(ic,20)}</span>
          </div>
          {cta}
        </div>"""


STATS = f"""
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
        <section class="rounded-card border border-outline-variant bg-surface-lowest p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-label-caps uppercase text-on-surface-variant">Completed appointments</p>
              <p class="mt-2 font-display text-hero text-on-surface tabular">342</p>
            </div>
            <span class="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-primary text-on-primary">{icon('check',22)}</span>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
              <p class="flex items-center gap-1.5 text-label-md text-on-surface-variant">{icon('userplus',14)} New patients</p>
              <p class="mt-1 font-display text-headline-sm text-on-surface tabular">4</p>
            </div>
            <div class="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
              <p class="flex items-center gap-1.5 text-label-md text-on-surface-variant">{icon('users',14)} Unique patients</p>
              <p class="mt-1 font-display text-headline-sm text-on-surface tabular">128</p>
            </div>
          </div>
        </section>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stat_tile("Today's Appointments", 18, 'calendar', 'text-primary', link=True)}
          {stat_tile('Confirmed', 11, 'shield', 'text-secondary')}
          {stat_tile('Pending', 5, 'clock', 'text-warning')}
          {stat_tile("Today's Completed", 7, 'check', 'text-tertiary')}
        </div>
      </div>"""


def session_bar(state):
    secondary = "inline-flex items-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md font-medium text-on-surface"
    if state == "live":
        tone, dot = "text-primary", "bg-primary"
        label, hint = "Consultation running", "Token #4 is with you now."
        controls = f'<button class="{secondary}">{icon("pause",16)}Pause Consultation</button>'
        toggle = f'<button class="inline-flex items-center gap-2 rounded-control bg-error px-5 py-2.5 text-body-md font-semibold text-on-error">{icon("power",16)}Stop OPD</button>'
    else:
        tone, dot = "text-on-surface-variant", "bg-outline"
        label, hint = "OPD closed", "Start OPD to open the token queue for today."
        controls = ""
        toggle = f'<button class="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary">{icon("power",16)}Start OPD</button>'

    return f"""
      <div class="flex flex-col gap-4 rounded-card border border-outline-variant bg-surface-lowest px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-3">
          <span class="relative flex h-9 w-9 flex-none items-center justify-center rounded-control bg-surface-container">
            <span class="{tone}">{icon('stethoscope')}</span>
            <span class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-pill ring-2 ring-surface-lowest {dot}"></span>
          </span>
          <div>
            <p class="font-display text-title-card {tone}">{label}</p>
            <p class="text-body-sm text-on-surface-variant">{hint}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">{controls}{toggle}</div>
      </div>"""


CURRENT_PATIENT = f"""
      <section class="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div class="flex items-center justify-between gap-3 border-b border-outline-variant bg-primary-container/10 px-5 py-3">
          <span class="flex items-center gap-2 text-label-caps uppercase text-primary">
            <span class="relative flex h-2.5 w-2.5"><span class="absolute inline-flex h-full w-full animate-ping rounded-pill bg-primary opacity-70"></span><span class="relative inline-flex h-2.5 w-2.5 rounded-pill bg-primary"></span></span>
            In consultation
          </span>
          <span class="rounded-pill bg-primary px-3 py-1 text-label-md font-semibold text-on-primary tabular">Token #4</span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-4">
            <span class="flex h-14 w-14 flex-none items-center justify-center rounded-pill bg-secondary-container text-on-secondary-container">{icon('user',26)}</span>
            <div class="min-w-0">
              <h2 class="truncate font-display text-headline-md text-on-surface">Rohan Mehta</h2>
              <p class="truncate text-body-md text-on-surface-variant">rohan.mehta@example.com</p>
            </div>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
              <p class="text-label-caps uppercase text-on-surface-variant">Started at</p>
              <p class="mt-1 flex items-center gap-1.5 text-body-lg font-medium text-on-surface tabular">{icon('clock',16)}09:42</p>
            </div>
            <div class="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
              <p class="text-label-caps uppercase text-on-surface-variant">Status</p>
              <p class="mt-1 text-body-lg font-medium text-primary">Consultation running</p>
            </div>
          </div>
          <div class="mt-5 grid gap-2 sm:grid-cols-2">
            <button class="inline-flex items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 text-body-md font-semibold text-on-primary">{icon('check',17)} Complete Appointment</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-3 text-body-md font-medium text-on-surface">{icon('eye',17)} See Profile</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-3 text-body-md font-medium text-on-surface">{icon('pill',17)} Add Prescription</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-3 text-body-md font-medium text-on-surface">{icon('phone',17)} Call Next</button>
          </div>
        </div>
      </section>"""

QUEUE_ROWS = [
    (5, "Priya Nair", "priya.nair@example.com", "10:00"),
    (6, "Imran Sheikh", "imran.sheikh@example.com", "10:15"),
    (7, "Kavya Iyer", "kavya.iyer@example.com", "10:30"),
    (8, "Vikram Bose", "vikram.bose@example.com", "10:45"),
]


def queue_list():
    rows = ""
    for token, name, email, slot in QUEUE_ROWS:
        rows += f"""
            <li class="grid grid-cols-2 items-center gap-3 border-b border-outline-variant/70 px-5 py-3 last:border-b-0 sm:grid-cols-12">
              <div class="sm:col-span-2"><span class="inline-flex h-9 min-w-9 items-center justify-center rounded-control bg-primary-container/20 px-2 text-body-md font-semibold text-primary tabular">#{token}</span></div>
              <div class="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-5">
                <p class="truncate text-body-md font-medium text-on-surface">{name}</p>
                <p class="truncate text-body-sm text-on-surface-variant">{email}</p>
              </div>
              <div class="text-body-md text-on-surface-variant tabular sm:col-span-2">{slot}</div>
              <div class="sm:col-span-2"><span class="inline-flex items-center rounded-pill bg-warning-container px-2.5 py-1 text-label-md font-medium text-on-warning-container">Waiting</span></div>
              <div class="flex justify-end sm:col-span-1"><span class="inline-flex items-center gap-1.5 rounded-control border border-outline-variant px-2.5 py-1.5 text-label-md font-medium text-on-surface-variant">{icon('eye',14)}<span class="hidden lg:inline">View</span></span></div>
            </li>"""

    return f"""
      <section class="flex flex-col overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div class="flex flex-col gap-3 border-b border-outline-variant px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="font-display text-headline-sm text-on-surface">Waiting queue</h2>
            <p class="mt-0.5 flex items-center gap-1.5 text-body-sm text-on-surface-variant">{icon('users',14)}<span class="tabular">4</span> confirmed offline patients waiting</p>
          </div>
          <div class="relative w-full lg:w-64">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">{icon('search',16)}</span>
            <span class="block w-full rounded-control border border-outline-variant bg-surface-container py-2 pl-9 pr-3 text-body-md text-on-surface-variant">Search patient…</span>
          </div>
        </div>
        <div class="hidden grid-cols-12 gap-3 border-b border-outline-variant bg-surface-container px-5 py-2 text-label-caps uppercase text-on-surface-variant sm:grid">
          <span class="col-span-2">Token</span><span class="col-span-5">Patient</span><span class="col-span-2">Slot</span><span class="col-span-2">Status</span><span class="col-span-1 text-right">Action</span>
        </div>
        <ul>{rows}</ul>
      </section>"""


LEDGER_ROWS = [
    (1, "Ananya Desai", "ananya.desai@example.com", "08:12", "CONFIRMED"),
    (2, "Rahul Verma", "rahul.verma@example.com", "08:26", "CONFIRMED"),
    (3, "Sana Qureshi", "sana.qureshi@example.com", "08:41", "PENDING"),
    (4, "Rohan Mehta", "rohan.mehta@example.com", "09:03", "CONFIRMED"),
    (5, "Priya Nair", "priya.nair@example.com", "09:15", "PENDING"),
    (6, "Dev Chauhan", "dev.chauhan@example.com", "09:31", "CANCELLED"),
]

STATUS_CLS = {
    "PENDING": "bg-warning-container text-on-warning-container",
    "CONFIRMED": "bg-primary-container/20 text-primary",
    "CANCELLED": "bg-error-container text-on-error-container",
}


def ledger():
    rows = ""
    for token, name, email, booked, status in LEDGER_ROWS:
        actions = ""
        if status == "PENDING":
            actions = (
                '<button class="rounded-control bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary">Confirm</button>'
                '<button class="rounded-control border border-outline-variant px-4 py-2 text-body-sm font-medium text-error">Cancel</button>'
            )
        rows += f"""
            <li class="grid grid-cols-2 items-center gap-3 border-b border-outline-variant/70 px-5 py-3 last:border-b-0 md:grid-cols-12">
              <div class="md:col-span-1"><span class="inline-flex h-9 min-w-9 items-center justify-center rounded-control bg-primary-container/20 px-2 text-body-md font-semibold text-primary tabular">#{token}</span></div>
              <div class="order-3 col-span-2 min-w-0 md:order-none md:col-span-4">
                <p class="truncate text-body-md font-medium text-on-surface">{name}</p>
                <p class="truncate text-body-sm text-on-surface-variant">{email}</p>
              </div>
              <div class="text-body-md text-on-surface-variant tabular md:col-span-2">{booked}</div>
              <div class="md:col-span-2"><span class="inline-flex items-center rounded-pill px-2.5 py-1 text-label-md font-medium {STATUS_CLS[status]}">{status}</span></div>
              <div class="order-4 col-span-2 flex flex-wrap justify-end gap-2 md:order-none md:col-span-3">{actions}</div>
            </li>"""

    right = f"""
        <div class="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-control bg-primary-container/20 text-primary">{icon('users')}</span>
          <span>
            <span class="block text-label-caps uppercase text-on-surface-variant">Booked today</span>
            <span class="block font-display text-headline-sm text-on-surface tabular">6</span>
          </span>
        </div>"""

    return (
        page_header(
            "Today's Appointments",
            "Cardiology · Metro General Hospital",
            right,
        )
        + f"""
      <section class="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div class="hidden grid-cols-12 gap-3 border-b border-outline-variant bg-surface-container px-5 py-2 text-label-caps uppercase text-on-surface-variant md:grid">
          <span class="col-span-1">Token</span><span class="col-span-4">Patient</span><span class="col-span-2">Booked</span><span class="col-span-2">Status</span><span class="col-span-3 text-right">Actions</span>
        </div>
        <ul>{rows}</ul>
      </section>"""
    )


def frame(theme, active, opd_state, content, nav=None, section="Clinical suite"):
    dark = " dark" if theme == "dark" else ""
    return f"""
    <div class="frame{dark}">
      <div class="flex min-h-full bg-background text-on-background">
        {sidebar(active, opd_state, nav, section)}
        <div class="flex min-w-0 flex-1 flex-col">
          {topbar(theme)}
          <main class="flex flex-1 flex-col gap-6 px-6 py-6">{content}</main>
        </div>
      </div>
    </div>"""


console_content = (
    page_header(
        "OPD Console",
        "Today's intake, the live consultation and the waiting queue in one view.",
        SHIFT_CLOCK,
    )
    + STATS
    + session_bar("live")
    + f'<div class="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">{CURRENT_PATIENT}{queue_list()}</div>'
)

# ------------------------------------------------------------- patient screens


def info_item(ic, label, value):
    return f"""
          <div class="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-container px-4 py-3">
            <span class="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">{icon(ic,18)}</span>
            <div class="min-w-0">
              <p class="text-label-caps uppercase text-on-surface-variant">{label}</p>
              <p class="mt-0.5 text-body-md font-medium text-on-surface">{value}</p>
            </div>
          </div>"""


def rx_card(ic, title, copy, active):
    tone = "bg-primary text-on-primary" if active else "bg-surface-container text-on-surface-variant"
    border = "border-primary bg-primary-container/10" if active else "border-outline-variant bg-surface-lowest"
    return f"""
        <div class="rounded-card border p-5 text-left {border}">
          <span class="flex h-11 w-11 items-center justify-center rounded-control {tone}">{icon(ic,20)}</span>
          <h2 class="mt-4 font-display text-title-card text-on-surface">{title}</h2>
          <p class="mt-1 text-body-sm text-on-surface-variant">{copy}</p>
        </div>"""


def rx_field(label, value):
    return f"""
          <div>
            <span class="mb-1.5 block text-label-md text-on-surface-variant">{label}</span>
            <span class="block w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface">{value}</span>
          </div>"""


PATIENT_CARD = f"""
      <section class="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div class="flex flex-col gap-5 border-b border-outline-variant bg-primary-container/10 px-6 py-6 sm:flex-row sm:items-center">
          <div class="flex h-24 w-24 flex-none items-center justify-center rounded-pill border border-outline-variant bg-surface-container text-on-surface-variant">{icon('userround',44)}</div>
          <div class="min-w-0">
            <p class="text-label-caps uppercase text-primary">Patient record</p>
            <h2 class="mt-1 font-display text-headline-lg text-on-surface">Rohan Mehta</h2>
            <p class="mt-2 flex items-center gap-2 text-body-md text-on-surface-variant">{icon('user',16)}<span>rohan.mehta@example.com</span></p>
          </div>
        </div>
        <div class="px-6 py-6">
          <h3 class="font-display text-headline-sm text-on-surface">Personal information</h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {info_item('calendar', 'Date of birth', '14 March 1988')}
            {info_item('user', 'Gender', 'Male')}
            {info_item('droplet', 'Blood group', 'O+')}
            {info_item('phone', 'Phone number', '+91 98200 41122')}
          </div>
        </div>
      </section>"""

SUMMARY = f"""
      <div class="flex flex-wrap gap-2">
        <button class="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary">{icon('activity',16)} See medical summary</button>
        <button class="inline-flex items-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md font-medium text-on-surface">{icon('clock',16)} Previous reports and prescriptions</button>
        <button class="inline-flex items-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md font-medium text-on-surface">{icon('share',16)} Shared reports and prescriptions</button>
      </div>
      <section class="rounded-card border border-outline-variant bg-surface-lowest p-6">
        <div class="flex items-start gap-3 border-b border-outline-variant pb-4">
          <span class="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary text-on-primary">{icon('activity',18)}</span>
          <div>
            <h2 class="font-display text-headline-sm text-on-surface">Medical summary</h2>
            <p class="mt-0.5 text-body-md text-on-surface-variant">38-year-old male, seen four times in the last eight months for hypertension follow-up.</p>
          </div>
        </div>
        <div class="mt-5">
          <h3 class="text-label-caps uppercase text-on-surface-variant">Points of attention</h3>
          <ul class="mt-2 flex flex-col gap-1">
            <li class="text-body-md text-on-surface">Blood pressure has stayed above target across the last three readings.</li>
            <li class="text-body-md text-on-surface">Reports intermittent dizziness in the mornings.</li>
          </ul>
        </div>
        <div class="mt-5">
          <h3 class="text-label-caps uppercase text-on-surface-variant">Medicines, as last prescribed</h3>
          <ul class="mt-2 flex flex-col gap-1">
            <li class="text-body-md text-on-surface">Amlodipine 5mg, once daily, 30 days<span class="text-on-surface-variant"> (prescribed 12 August 2026)</span></li>
            <li class="text-body-md text-on-surface">Atorvastatin 10mg, at night, 30 days<span class="text-on-surface-variant"> (prescribed 12 August 2026)</span></li>
          </ul>
        </div>
        <p class="mt-6 border-t border-outline-variant pt-4 text-body-sm text-on-surface-variant">Generated from the record on file. Verify against the patient before acting on it.</p>
      </section>"""

PRESCRIPTION = f"""
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        {rx_card('pencil', 'Manual prescription', 'Enter complaints, diagnosis, medicines, tests and advice manually.', True)}
        {rx_card('camera', 'Upload prescription', 'Upload an existing prescription image and extract its information using OCR.', False)}
        {rx_card('activity', 'Describe prescription', 'Describe the prescription in normal language and let AI structure it.', False)}
      </div>
      <div class="rounded-card border border-outline-variant bg-surface-lowest p-6">
        <h2 class="font-display text-headline-sm text-on-surface">Manual prescription</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          {rx_field('Complaints', 'Fever, Headache')}
          {rx_field('Diagnosis', 'Viral fever')}
        </div>
        <div class="mt-6">
          <div class="flex items-center justify-between">
            <span class="text-label-md text-on-surface-variant">Medicines</span>
            <span class="inline-flex items-center gap-1.5 rounded-control border border-outline-variant px-3 py-2 text-body-sm font-medium text-on-surface">+ Add medicine</span>
          </div>
          <div class="mt-3 rounded-card border border-outline-variant bg-surface-container p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-label-caps uppercase text-on-surface-variant">Medicine 1</h3>
              <span class="text-body-sm font-medium text-error">Remove</span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <span class="block rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface">Paracetamol</span>
              <span class="block rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface">500mg</span>
              <span class="block rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface">BD</span>
              <span class="block rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface">5 days</span>
            </div>
            <span class="mt-3 block rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface">After food</span>
          </div>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          {rx_field('Tests', 'CBC, LFT')}
          {rx_field('Follow-up date', '2026-09-10')}
        </div>
        <button class="mt-6 inline-flex items-center gap-2 rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary">Create prescription</button>
      </div>"""

patient_content = (
    page_header(
        "Patient record",
        "Identity, an AI recap of everything on file, and the full report and prescription history.",
        "",
    )
    + PATIENT_CARD
    + SUMMARY
)

prescription_content = (
    page_header(
        "Create Prescription",
        "Choose how you want to create the prescription for this consultation.",
        "",
    )
    + PRESCRIPTION
)

# --------------------------------------------------------------- login screen


def audience(ic, label, copy):
    return f"""
              <li class="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
                <span class="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">{icon(ic,18)}</span>
                <span class="min-w-0">
                  <span class="block text-body-md font-medium text-on-surface">{label}</span>
                  <span class="block text-body-sm text-on-surface-variant">{copy}</span>
                </span>
              </li>"""


LOGIN = f"""
    <div class="min-h-full bg-background px-4 py-8 text-on-background">
      <div class="mx-auto grid w-full max-w-6xl overflow-hidden rounded-card border border-outline-variant bg-surface-lowest lg:grid-cols-[1.05fr_1fr]">
        <div class="flex flex-col justify-between gap-10 border-r border-outline-variant bg-primary-container/10 px-10 py-12">
          <div>
            <span class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-card bg-primary text-on-primary">{icon('stethoscope',20)}</span>
              <span>
                <span class="block font-display text-title-card text-on-surface">mediReach</span>
                <span class="block text-label-caps uppercase text-on-surface-variant">Clinical Gateway</span>
              </span>
            </span>
            <h1 class="mt-10 max-w-md font-display text-hero text-on-surface">Your healthcare network, in one place.</h1>
            <p class="mt-4 max-w-md text-body-lg text-on-surface-variant">One sign-in for every role on the platform. Where you land is decided by the account, not by this page.</p>
          </div>
          <ul class="flex flex-col gap-3">
            {audience('domain', 'Hospitals', 'Departments, staff and OPD scheduling')}
            {audience('stethoscope', 'Doctors', 'Live token queue and consultations')}
            {audience('pill', 'Pharmacies', 'Batch inventory and expiry tracking')}
            {audience('userround', 'Patients', 'Bookings, reports and prescriptions')}
          </ul>
          <p class="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-on-surface-variant">
            <span class="flex items-center gap-1.5">{icon('shield',14)}Role-scoped access</span>
            <span class="flex items-center gap-1.5">{icon('clock',14)}Sessions expire after 7 days</span>
          </p>
        </div>

        <div class="flex items-center justify-center px-10 py-10">
          <div class="w-full max-w-md">
            <p class="text-label-caps uppercase text-primary">Sign in</p>
            <h2 class="mt-1 font-display text-headline-lg text-on-surface">Welcome back</h2>
            <p class="mt-2 text-body-md text-on-surface-variant">Secure, fast and reliable healthcare access.</p>

            <div class="mt-6 grid grid-cols-2 gap-1 rounded-control border border-outline-variant bg-surface-container p-1">
              <span class="rounded-control py-2 text-center text-body-md text-on-surface-variant">Hospital</span>
              <span class="rounded-control bg-surface-lowest py-2 text-center text-body-md font-medium text-primary">Doctor</span>
            </div>

            <div class="mt-6 flex flex-col gap-4">
              <div>
                <span class="mb-1.5 block text-label-md text-on-surface-variant">Email / phone number</span>
                <span class="block w-full rounded-control border border-outline-variant bg-surface-container px-3.5 py-3 text-body-md text-on-surface-variant">Enter email</span>
              </div>
              <div>
                <span class="mb-1.5 block text-label-md text-on-surface-variant">Password</span>
                <span class="block w-full rounded-control border border-outline-variant bg-surface-container px-3.5 py-3 text-body-md text-on-surface-variant">********</span>
              </div>
              <div class="text-right"><span class="text-body-sm font-medium text-primary">Forgot Password?</span></div>
              <button class="w-full rounded-control bg-primary py-3 text-body-md font-semibold text-on-primary">Login</button>
              <button class="w-full rounded-control border border-outline-variant py-3 text-body-md font-medium text-on-surface">Continue with Google</button>
            </div>

            <p class="mt-6 text-center text-body-md text-on-surface-variant">Don't have an account? <span class="font-medium text-primary">Sign Up</span></p>
          </div>
        </div>
      </div>
    </div>"""


def bare_frame(theme, content):
    dark = " dark" if theme == "dark" else ""
    return f"""
    <div class="frame{dark}">{content}</div>"""


# -------------------------------------------------------------- admin screens


def admin_stat(label, value, ic, tint):
    return f"""
        <div class="relative flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span style="background-color:{tint}" class="flex h-11 w-11 flex-none items-center justify-center rounded-control text-white">{icon(ic,20)}</span>
              <div class="min-w-0">
                <p class="text-label-caps uppercase text-on-surface-variant">{label}</p>
                <p class="mt-1 font-display text-headline-lg text-on-surface tabular">{value}</p>
              </div>
            </div>
            <span class="flex-none rounded-control p-1.5 text-on-surface-variant">{icon('dots',18)}</span>
          </div>
          <span class="mt-4 inline-flex items-center gap-1.5 self-start text-label-md font-medium text-primary">View all →</span>
        </div>"""


def status_row(initial, name, email, dept, online, seen):
    chip = (
        '<span class="inline-flex items-center gap-2 rounded-pill bg-primary-container/20 px-2.5 py-1 text-label-md font-medium text-primary"><span class="h-2 w-2 rounded-pill bg-primary"></span>Online</span>'
        if online
        else '<span class="inline-flex items-center gap-2 rounded-pill bg-surface-high px-2.5 py-1 text-label-md font-medium text-on-surface-variant"><span class="h-2 w-2 rounded-pill bg-outline"></span>Offline</span>'
    )
    return f"""
              <tr class="border-b border-outline-variant/70 last:border-b-0">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-surface-high font-display text-title-card text-on-surface-variant">{initial}</span>
                    <div class="min-w-0">
                      <p class="truncate text-body-md font-medium text-on-surface">{name}</p>
                      <p class="truncate text-body-sm text-on-surface-variant">{email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 text-body-md text-on-surface-variant">{dept}</td>
                <td class="px-5 py-3">{chip}</td>
                <td class="px-5 py-3 text-body-md text-on-surface-variant tabular">{seen}</td>
              </tr>"""


ADMIN_OVERVIEW = f"""
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {admin_stat('Total Departments', 6, 'domain', '#00685f')}
        {admin_stat('Total Doctors', 24, 'stethoscope', '#006398')}
        {admin_stat('Total Appointments Today', 148, 'calendar', '#4648d4')}
        {admin_stat('Total Patients Today', 132, 'users', '#008378')}
      </div>

      <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="font-display text-headline-sm text-on-surface">Doctor status</h2>
            <p class="mt-0.5 text-body-md text-on-surface-variant">Monitor doctor availability in real time.</p>
          </div>
          <span class="inline-flex items-center gap-2 rounded-pill bg-primary-container/20 px-3 py-1.5 text-label-md font-medium text-primary">
            <span class="h-2 w-2 rounded-pill bg-primary"></span>Live
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
            <p class="text-label-caps uppercase text-on-surface-variant">Total doctors</p>
            <p class="mt-1 font-display text-headline-lg text-on-surface tabular">24</p>
          </div>
          <div class="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
            <p class="text-label-caps uppercase text-on-surface-variant">Online</p>
            <p class="mt-1 font-display text-headline-lg text-primary tabular">9</p>
          </div>
          <div class="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
            <p class="text-label-caps uppercase text-on-surface-variant">Offline</p>
            <p class="mt-1 font-display text-headline-lg text-on-surface-variant tabular">15</p>
          </div>
        </div>

        <div class="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-surface-container">
                <th class="border-b border-outline-variant px-5 py-2.5 text-label-caps uppercase text-on-surface-variant">Doctor</th>
                <th class="border-b border-outline-variant px-5 py-2.5 text-label-caps uppercase text-on-surface-variant">Department</th>
                <th class="border-b border-outline-variant px-5 py-2.5 text-label-caps uppercase text-on-surface-variant">Status</th>
                <th class="border-b border-outline-variant px-5 py-2.5 text-label-caps uppercase text-on-surface-variant">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {status_row('A', 'Dr. Ananya Rao', 'ananya.rao@metro.in', 'Cardiology', True, 'Currently online')}
              {status_row('V', 'Dr. Vikram Bose', 'vikram.bose@metro.in', 'Orthopaedics', True, 'Currently online')}
              {status_row('S', 'Dr. Sana Qureshi', 'sana.qureshi@metro.in', 'Paediatrics', False, '02/09/2026, 18:40')}
              {status_row('R', 'Dr. Rahul Verma', 'rahul.verma@metro.in', 'Dermatology', False, 'Never')}
            </tbody>
          </table>
        </div>
      </section>"""

admin_content = (
    page_header(
        "Hospital Overview",
        "Departments, doctors and today's load, with live availability from the socket feed.",
        SHIFT_CLOCK,
    )
    + ADMIN_OVERVIEW
)

closed_content = (
    page_header(
        "OPD Console",
        "Today's intake, the live consultation and the waiting queue in one view.",
        SHIFT_CLOCK,
    )
    + STATS
    + session_bar("closed")
)

doc = f"""<title>MediReach Redesign Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap">
<style>
{css}
</style>
<style>
  .page {{ max-width: 1320px; margin: 0 auto; padding: 32px 20px 72px; }}
  .page-head {{ margin-bottom: 28px; }}
  .page-head h1 {{
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 30px; line-height: 1.15;
    font-weight: 700; letter-spacing: -.02em; margin: 0; color: #131b2e;
  }}
  .page-head p {{ margin: 8px 0 0; max-width: 70ch; color: #4d5f5c; font-size: 15px; line-height: 1.55; }}
  .shot-label {{
    display: flex; align-items: baseline; gap: 10px; margin: 34px 0 10px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: .1em; text-transform: uppercase; color: #4d5f5c;
  }}
  .shot-label::after {{ content: ""; flex: 1; height: 1px; background: #d6e0dc; }}
  .shot-label span {{ font-family: Inter, sans-serif; font-size: 12px; letter-spacing: 0; text-transform: none; color: #7b8a87; }}
  .frame {{
    border: 1px solid #d6e0dc; border-radius: 10px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(19,27,46,.05), 0 14px 34px -24px rgba(19,27,46,.6);
  }}
  .note {{
    margin-top: 34px; border-left: 3px solid #00685f; background: #00685f0f;
    padding: 12px 16px; border-radius: 0 8px 8px 0; color: #14211f; font-size: 14px; line-height: 1.6;
  }}
  .note b {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
  body {{ background: #f2f5f4 !important; }}
</style>

<div class="page">
  <div class="page-head">
    <h1>MediReach Redesign Preview</h1>
    <p>Static preview of the redesigned doctor screens in <code>new_UI/</code>, rendered with the project's own compiled Tailwind bundle and the Material&nbsp;3 tokens lifted from the Stitch designs. Sample data stands in for the API; every control shown is wired to the same handler it had before.</p>
  </div>

  <div class="shot-label">01 — Unified sign-in <span>light theme</span></div>
  {bare_frame('light', LOGIN)}

  <div class="shot-label">02 — Unified sign-in <span>dark theme</span></div>
  {bare_frame('dark', LOGIN)}

  <div class="shot-label">03 — OPD Console, consultation running <span>light theme</span></div>
  {frame('light', 'console', 'live', console_content)}

  <div class="shot-label">04 — Today's Appointments ledger <span>dark theme</span></div>
  {frame('dark', 'appointments', 'closed', ledger())}

  <div class="shot-label">05 — OPD Console before the session starts <span>dark theme</span></div>
  {frame('dark', 'console', 'closed', closed_content)}

  <div class="shot-label">06 — Patient record with the AI medical summary <span>light theme</span></div>
  {frame('light', '', 'live', patient_content)}

  <div class="shot-label">07 — Create prescription, manual entry <span>dark theme</span></div>
  {frame('dark', '', 'live', prescription_content)}

  <div class="shot-label">08 — Hospital overview with the live doctor board <span>light theme</span></div>
  {frame('light', 'overview', 'admin', admin_content, ADMIN_NAV, 'Administration')}

  <div class="note">
    <b>Note on the queue columns.</b> The Stitch roster shows MRN, chief complaint and live vitals.
    <code>GET /appointments/today</code> and <code>GET /appointments/my</code> return only token, patient name/email, status and timestamps,
    so those columns are left out rather than filled with invented data.
  </div>

  <div class="note">
    <b>Preserved, not fixed.</b> On the prescription screen, the OCR and AI paths' <i>Confirm &amp; save</i> button posts to
    <code>CREATE_PRESCRIPTION_API</code>, which is not defined anywhere in the project — it throws, and the catch shows
    &ldquo;Failed to save prescription.&rdquo; That predates the redesign and was left exactly as it was, along with the inert
    View / Cancel / Shared-reports buttons.
  </div>
</div>
"""

out = os.path.join(ROOT, ".stitch-screens", "opd-preview.html")
io.open(out, "w", encoding="utf-8").write(doc)
print(out, os.path.getsize(out) // 1024, "KB")
