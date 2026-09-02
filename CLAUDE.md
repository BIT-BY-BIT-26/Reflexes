# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**MediReach** (repo name `Reflexes`) — a healthcare platform connecting patients, hospitals, doctors, and pharmacies, built for SIH 2026 by team BIT-BY-BIT-26.

This is a **monorepo of loosely-coupled sub-projects**, not one app. `Backend/`, `UI/`, and `Frontend/` are actively developed; `patient_app/` is live but last touched 2026-07-26. The Python folders and the loose `*.py` files at the repo root are standalone AI experiments frozen since Feb 2026 and are **not called by the backend** — do not assume they are wired in. (`app_with_pinecone.py` exists at the root *and* in `medical_chatbot/`, and the two copies have diverged.)

## Commands

```bash
# Backend (Node + Express) — needs MongoDB + Redis reachable
cd Backend && npm install && npm start        # runs `node index.js`; there is NO `npm run dev`

# UI/ — a web frontend (Vite 8, Tailwind 4, React Query)
cd UI && npm install && npm run dev           # also: npm run build, npm run lint, npm run preview

# Frontend/ — the parallel web frontend (Vite 7, Tailwind 3, Redux thunks)
cd Frontend && npm install && npm run dev     # same script names

# patient_app/ — Flutter patient mobile app
cd patient_app && flutter pub get && flutter run

# Python sub-projects (each independent)
cd medical_chatbot && pip install -r requirements.txt && python app_with_pinecone.py
cd medical_prescription_chatbot && uv sync && streamlit run app.py
```

**There are no tests anywhere.** `Backend/package.json` has the default `exit 1` test stub. No CI, no Dockerfile.

### Backend environment

`Backend/.env` (no `.env.example` exists — these are the vars actually read in code):
`PORT`, `MONGO_URI`, `JWT_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `ORS_API_KEY`, `NODE_ENV`.

`REDIS_PASSWORD` is **commented out** in `config/redisClient.js` — a hosted Redis needing auth will fail until that line is restored.

Cloudinary credentials are **hardcoded** in `Backend/config/cloudinary.js` rather than read from env — if you touch that file, move them to env vars.

## Architecture

### Backend (`Backend/index.js`)

Express 5 + Mongoose 9 + Socket.IO + ioredis + Cloudinary + node-cron. Boot order: dotenv → Mongo connect → start expiry cron → wrap Express in `http.Server` → attach Socket.IO → mount 14 routers under `/api/*`.

Two patterns to know before editing controllers:

- **`io` is stashed on the app**, not imported: `app.set("io", io)` in `index.js`, retrieved as `req.app.get("io")` in controllers. Follow this; don't add a new import path for the socket server. `app.set("redis", redisClient)` sits next to it but **nothing ever reads it** — every controller does `const { redisClient } = require("../config/redisClient")` instead. Match the surrounding file rather than the `index.js` wiring.
- **`onlineDoctors` / `onlinePatients` are in-memory `Map`s** created in `index.js` and passed into `socketHandler`. This caps the backend at **one process** — any change assuming multiple instances needs a Redis socket.io adapter first.

### Auth & roles

Five roles in `Backend/config/role.js`: `HOSPITAL_ADMIN`, `DOCTOR`, `PATIENT`, `PHARMACY`, `PLATFORM_ADMIN`. `UI/src/constants/Role.js` mirrors all five; `Frontend/src/constants/role.js` is missing `platform_admin`; the Flutter app has no constants file and hardcodes `"PATIENT"`. Changing a role string means touching all of these.

- HTTP: `middleware/auth.js` (verify JWT, load full `User` onto `req.user`) then `middleware/authorize(...roles)`. Order matters; `authorize` reads `req.user.role`.
- Sockets: separate `io.use()` guard in `Backend/socket.js` verifying the same JWT from `socket.handshake.auth.token`.
- Web: `UI/src/Routes/protectedRoutes.jsx` role-gates routes and redirects a mismatched role to its own dashboard.
- The JWT payload is `{ id, role, hospitalId }`, 7-day expiry, signed in `authController.loginUser`. Login also resolves and returns the role's profile id (`patientId` / `doctorId` / `pharmacyId`) — clients rely on that rather than a second lookup.

**Auth coverage is inconsistent.** `routes/platformOwnerRoute.js` has no auth on any route (including `PUT /approve/:id` and `GET /all-hospitals`), and several routes in `departmentRoute.js` (`PATCH /:id`, `DELETE /:id`, `PATCH /:id/toggle-status`) and `appointment.js` (`PATCH /appointments/:id/confirm`) are unauthenticated. Most doctor routes carry `auth` but no `authorize`. When adding routes near these, add `auth` + `authorize` explicitly rather than copying the neighbouring line.

### Domain model

`User` is the auth identity; `Doctor`, `Patient`, and `Pharmacy` are 1:1 profile documents keyed by `userId`. Look up a doctor as `docterModel.findOne({ userId: req.user.id })` — note the misspelled model file `models/docterModel.js`.

Geospatial `2dsphere` indexes exist on `Hospital`, `Pharmacy`, and `Emergency`. `Patient.address.location` is a GeoJSON Point **without** a `2dsphere` index — `$near`/`$geoWithin` on patients will fail until one is added. Coordinates are `[lng, lat]` everywhere.

`Medicine` is modelled **per batch**, not per drug — the same medicine appears multiple times with different `batchNumber`/`expiryDate`. The expiry cron depends on this.

### OPD queue (the core subsystem)

`Backend/controllers/DoctorController.js` (~1430 lines) drives a live token-based outpatient queue over `Appointment.status`:

```
PENDING → CONFIRMED → CURRENT → COMPLETED | SKIPPED     (also: CANCELLED)
```

The queue endpoints are mounted under **`/api/consultation`** (`routes/consultationRoute.js`), not `/api/doctors` — `routes/doctor.js` imports `startConsultation`, `callNext`, etc. but registers none of them, so grep for the handler name, not the URL. Only `toggle-opd` lives on the doctor router.

Invariants that are deliberately enforced — preserve them:

- **At most one `CURRENT` appointment per doctor per day.** `startConsultation` claims it with a conditional `findOneAndUpdate({ _id, status: "CONFIRMED" }, ...)` and returns `409` to the loser of a race. Do not replace this with a read-then-write.
- **`toggleOpd` refuses to switch OPD off while an appointment is `CURRENT`**, mirroring the guard in `stopConsultation`.
- `advanceQueue({ doctor, io, closeStatus, socketEventName, closingMessage })` is the shared helper behind **`completeConsultation`, `skipPatient`, and `callNext`**: close current → atomically promote lowest-token `CONFIRMED` (`sort: { token: 1 }`) → emit `socketEventName`, or flip `opdStarted = false` and emit `opdStopped` when the queue drains. It errors only when `closeStatus === "SKIPPED"` and there is no current patient.
- Doctor socket disconnect resets `opdStarted`/`opdPaused` and stamps `lastSeen` (`Backend/socket.js`).

**Two different "today" helpers coexist and disagree.** `utils/utcday.js` `getUtcDayRange()` (UTC midnight boundaries) is used by `appointmentController` when writing and matching appointment dates; a local `getTodayRange()` defined inside `DoctorController.js` uses **server-local** midnight for every queue query. On a non-UTC server these select different day windows — match whichever the file already uses rather than mixing them.

### Sockets

Rooms actually joined: `doctor_<id>` (via `joinDoctor`) and `patient_<id>` (via `patient-join`). Server-side handlers: `joinDoctor`, `patient-join`, `disconnect`.

Server emits: `queueUpdated`, `opdStopped`, `opdPaused`, `opdResumed`, `consultationInterrupted`, `consultationCompleted`, `appointmentCompleted`, `doctor-online`, `doctor-offline`, `initial-doctor-status` (admins only, on connect), `new-appointment`, `APPOINTMENT_CONFIRMED`, `APPOINTMENT_COMPLETED`, `emergency-created`, `route-update`, `call-missed`, `consultation-started`.

Three real wiring bugs live here — check them before debugging "sockets don't work":

- `patientController.createEmergency` emits `emergency-created` to a **`hospital:<id>` room that nothing ever joins** — `socket.js` has no hospital join handler.
- `patient_app/lib/socket.dart` connects **without an auth token**, so the `io.use()` guard rejects it outright; it also emits `joinDoctorRoom`, which the server does not handle (the handler is `joinDoctor`).
- `Frontend/src/components/DoctorDashboard.jsx` and `Frontend/src/DoctorDashboard.jsx/startOpd.jsx` listen for `TOKEN_UPDATE`, `QUEUE_UPDATE`, `OPD_STARTED`, `JOIN_OPD`, `START_OPD` etc. — an older uppercase protocol the server never emits. `UI/src/features/Admin/DoctorStatus.jsx` and the Flutter queue screen use the current lowercase events.

### Redis caching

Read-through cache with explicit `EX` TTLs, invalidated only by `redisClient.del` in `appointmentController` (on confirm/complete). Keys in use: `doctor:todayAppointments:<doctorId>`, `doctor:dashboard:<doctorId>`, `departments:master-list`, `departments:counts:<hospitalId>`, `hospital:nearby:<lat>:<lng>:<radius>:<state>:<city>`, `hospital:list:<state>:<city>`, `hospital:cities:<state>`, `hospital:states`. Any write path that changes doctor/department/hospital data needs a matching `del` — most currently don't.

### Appointment booking rules

`controllers/appointmentController.js` validates in this order: type is `online`/`offline` → patient/doctor exist → valid date → no past dates → max 30 days ahead → weekday present and available in the doctor's `opdSchedule` (weekday computed in `Asia/Kolkata`) → same-day booking closes 30 min before OPD start → no duplicate active (`PENDING`/`CONFIRMED`) appointment that day for the same doctor **and same type** → sequential token assigned **for offline only** (online appointments keep `token: null`).

### Medicine OCR

`services/medicineAnalysisService.js` posts the in-memory upload (`middleware/memoryUpload.js`, 10 MB cap, images only, never hits disk) to an **external hosted vision API** at `https://medical-image-analysis-rh8u.onrender.com/analyze-medicine`, with a prompt pinning a fixed 9-field JSON schema. `Medicine.addedVia` records `OCR` vs `MANUAL`. `analyze.py` at the repo root is the standalone tester for that same endpoint. The README's claim that Tesseract.js does this server-side is wrong — Tesseract.js only runs client-side in `UI/src/features/pharmacy/WebcamMedicineOCR.jsx`.

Other uploads go straight to Cloudinary via `multer-storage-cloudinary` (`middleware/uploadCloud.js`, folders `medireach/patients|reports|hospitals`); `utils/getSignedUrl.js` signs report URLs on read.

### Emergency flow

`Emergency.status` advances `REQUESTED → ACKNOWLEDGED → AMBULANCE_ASSIGNED → ON_THE_WAY → ARRIVED → PATIENT_PICKED → COMPLETED`. Patient creates (`patientController.createEmergency`); hospital admin advances and attaches ambulance vehicle/driver details (`hospitalController.updateEmergencyStatus`).

### Cron

`cron/MedicineExpiryCron.js` runs `0 0 * * *` server-local: one `updateMany` setting `stock: 0, status: "EXPIRED"` on batches past expiry. Started from the Mongo connect callback in `index.js`, so it only runs if the DB connects.

## Frontends: `UI/` vs `Frontend/`

**Both are live and both still receive commits** — they are parallel implementations, not old/new.

- `UI/` — React Query + Redux Toolkit, Tailwind 4, feature folders (`features/Admin`, `features/doctor`, `features/pharmacy`), query hooks in `src/hooks/`, cache keys centralized in `src/hooks/queries/queryKeys.js`. Has the pharmacy webcam OCR. Routes in `src/Routes/AppRoutes.jsx`. The live Redux store is `src/redux/store.js` (theme / auth / notification / opd).
- `Frontend/` — older stack (Redux thunks, MUI, Tailwind 3) but holds features `UI/` lacks: WebRTC video consultation via `simple-peer` (`src/onlineConsultation.jsx/LiveCall.jsx`), `src/chatbot/MedicalChatbot.jsx`, forgot-password.

Neither has a patient dashboard — patients are served by `patient_app/`. When asked to change "the frontend", confirm which one.

All three clients hardcode `http://localhost:3000` (`UI/src/api/axiosInstance.js`, `UI/src/socket.js`, `Frontend/src/api/axios.js`, `Frontend/src/socket/socket.js`, `patient_app/lib/utils/constants.dart`) — there is no env-based API URL config; the deployed `https://reflexes.onrender.com` URLs sit commented out next to them.

## Flutter app (`patient_app/`)

Provider for state (not Bloc/Riverpod) with every provider registered in `lib/main.dart`, `http` for REST, `socket_io_client` for queue updates, `shared_preferences` for the JWT. Every feature follows a `screen / provider / service` triad under `lib/features/<name>/`. Maps via `flutter_map` + `geolocator`; lab reports via `syncfusion_flutter_pdfviewer`.

## Dead code — do not extend these

- `Backend/routes/opdRoute.js` and `Backend/utils/emitQueue.js` require `../controller/opdController` and `../model/tokenModel`, **neither of which exists**. They only avoid crashing because `index.js` never mounts them.
- `Backend/middleware/doctorMiddleware.js` (`isDoctor`, `profileCompletedOnly`) and `Backend/controllers/location.js` both require a non-existent `../model/` directory (the real one is `models/`); neither is imported anywhere.
- `Backend/routes/inventoryRoute.js` is never mounted, so all of `controllers/inventoryController.js` is unreachable. Medicine stock is handled through `medicineController.js` / `pharmacyController.js` instead.
- In `UI/src`: `lib/queryClient.js` is never imported (`main.jsx` constructs its own `new QueryClient()`, so any invalidation written against the exported instance is a no-op), `context/store.js` is empty, and `context/slice/AuthSlice.jsx` is superseded by `redux/slices/authSlice.js`.
- `mediscan/mediscan.py` imports five sibling modules that were never committed.
- `@google/genai` is a dependency of both `Backend/` and `UI/`, but only `Backend/services/medicalSummaryService.js` imports it — in `UI/` it is unused.

## Repo hygiene notes

- There is no root `.gitignore`, but each sub-project has its own — `Backend/.gitignore` already covers `.env` and `node_modules/`, and `UI/`, `Frontend/`, `patient_app/` and the Python folders ship theirs.
- `hi.txt` is tracked and contains plaintext account credentials; `Backend/config/cloudinary.js` contains hardcoded API secrets. Both should be scrubbed — flag this rather than adding more secrets alongside them.
- `README.md` has drifted from the code: it documents `npm run dev` for the backend, server-side Tesseract.js, and a lowercase `frontend/`+`backend/` layout. Trust the code over the README.
