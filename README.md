# 🏥 MediReach

### A Digital Healthcare Platform for Connected, Accessible & Continuous Care

MediReach is a full-stack healthcare management platform designed to connect **patients, hospitals, doctors, and pharmacies** through a unified digital ecosystem.

It aims to improve healthcare accessibility and continuity by enabling digital appointments, doctor consultations, prescriptions, pharmacy inventory management, medicine OCR, emergency assistance, and real-time communication between healthcare stakeholders.

---

## 🌐 Overview

In many rural and underserved communities, patients face challenges such as:

* Long travel distances to healthcare facilities
* Limited access to specialists
* Fragmented medical records
* Delayed referrals
* Difficulty managing prescriptions and medicines
* Lack of real-time communication with healthcare providers
* Emergency transportation challenges
* Limited continuity of care when patients move between facilities

**MediReach** addresses these challenges by bringing essential healthcare workflows into one connected platform.

```text
                         ┌─────────────────────┐
                         │      MediReach      │
                         │  Healthcare Platform │
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
     👤 PATIENT                🏥 HOSPITAL               💊 PHARMACY
          │                         │                         │
   ┌──────┴──────┐           ┌──────┴──────┐          ┌─────┴─────┐
   │ Appointments│           │ Departments │          │ Inventory  │
   │ Emergency   │           │ Doctors     │          │ OCR        │
   │ Prescriptions│          │ OPD         │          │ Expiry     │
   │ Reports     │           │ Reports     │          │ Management │
   └─────────────┘           └─────────────┘          └───────────┘
                                    │
                              👨‍⚕️ DOCTOR
                                    │
                          ┌─────────┴─────────┐
                          │ Appointments      │
                          │ OPD Schedule      │
                          │ Prescriptions     │
                          └───────────────────┘
```

---

# ✨ Key Features

## 👤 Patient Management

Patients can:

* Register and authenticate
* Search for healthcare providers
* Browse available doctors
* Book appointments
* View appointment information
* Access prescriptions and medical information
* Request emergency assistance
* Receive ambulance details
* Communicate through real-time services

---

## 🏥 Hospital Management

Hospital administrators can:

* Manage hospital information
* Manage departments
* Add and manage doctors
* Configure OPD schedules
* Manage appointments
* Access patient information
* Handle emergency requests
* Assign ambulances
* Monitor hospital operations

---

## 👨‍⚕️ Doctor Management

Doctors can:

* View their dashboard
* View today's appointments
* Manage appointment-related workflows
* Follow their OPD schedule
* Access patient information
* Create digital prescriptions
* Record complaints and diagnoses
* Prescribe medicines

### Prescription Structure

A prescription can contain:

```json
{
  "appointmentId": "appointment_id",
  "complaints": [
    "Fever",
    "Headache"
  ],
  "diagnosis": [
    "Viral Fever"
  ],
  "medicines": [
    {
      "name": "Paracetamol"
    }
  ]
}
```

---

# 💊 Pharmacy & Medicine Management

MediReach provides a dedicated pharmacy inventory system.

Pharmacies can manage:

* Medicine name
* Strength
* Batch number
* Manufacturing date
* Expiry date
* Price
* Category
* Manufacturer
* Description
* Stock
* Medicine status

Medicines can be added through:

```text
MANUAL
   or
  OCR
```

---

# 📷 AI-Assisted Medicine OCR

One of the key features of MediReach is automated medicine information extraction.

### Workflow

```text
Medicine Image
      │
      ▼
Camera / Upload
      │
      ▼
Tesseract.js OCR
      │
      ▼
AI Processing
      │
      ▼
Structured Medicine Data
      │
      ▼
Auto-filled Form
      │
      ▼
Pharmacy Inventory
```

The system can extract information such as:

* Medicine name
* Strength
* Batch number
* Manufacturing date
* Expiry date
* Price
* Category
* Manufacturer
* Description

This reduces manual data entry and helps pharmacists manage medicine records more efficiently.

---

# ⏰ Automated Medicine Expiry Management

MediReach uses scheduled background processing to monitor medicine batches.

When a medicine batch expires:

```text
Expiry Date < Current Date
          │
          ▼
      Stock = 0
          │
          ▼
    Status = EXPIRED
```

This helps prevent expired medicines from remaining available in active inventory.

The system also considers the fact that **the same medicine may have multiple batches with different expiry dates**.

---

# 📅 Appointment Management

MediReach provides an appointment management system connecting patients and doctors.

### Appointment Flow

```text
Patient
   │
   ▼
Select Doctor
   │
   ▼
Check OPD Schedule
   │
   ▼
Select Available Date/Time
   │
   ▼
Book Appointment
   │
   ▼
Doctor Dashboard
```

The system supports:

* Doctor-specific appointments
* OPD schedule validation
* Available days
* Date validation
* Advance booking restrictions
* Appointment management

---

# 🚑 Emergency Assistance

MediReach provides an emergency request workflow for patients who require ambulance assistance.

### Emergency Flow

```text
REQUESTED
    │
    ▼
ACKNOWLEDGED
    │
    ▼
AMBULANCE_ASSIGNED
    │
    ▼
ON_THE_WAY
    │
    ▼
ARRIVED
    │
    ▼
PATIENT_PICKED
    │
    ▼
COMPLETED
```

When assigning an ambulance, the hospital administrator can provide:

* 🚑 Ambulance number
* 👨‍✈️ Driver name
* 📞 Driver phone number

The patient can then receive the ambulance information.

A patient cannot create another emergency request while an existing emergency is still active.

---

# ⚡ Real-Time Communication

MediReach uses **Socket.IO** for real-time communication.

The system supports concepts such as:

* Doctor online status
* Patient connection
* Real-time room joining
* Doctor-patient communication
* Emergency-related real-time events

Example events include:

```text
joinDoctor
patient-join
join-call-room
```

---

# 🚀 Redis Caching

Redis is used to reduce repeated database queries and improve backend performance.

Examples of cached data include:

```text
departments:master-list

doctor:dashboard:{doctorId}

doctor:todayAppointments:{doctorId}
```

The application tracks cache hits and misses to monitor caching behavior.

---

# 🔐 Role-Based Access Control

MediReach follows a role-based access architecture.

### Supported Roles

```text
SUPER_ADMIN / PLATFORM_ADMIN
        │
        ├── Hospital Admin
        │
        ├── Doctor
        │
        ├── Pharmacy
        │
        └── Patient
```

Both frontend protected routes and backend authorization middleware are used to restrict access to role-specific resources.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       Frontend       │
                    │   React + Tailwind   │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       Backend        │
                    │    Node + Express    │
                    └──────┬───────┬───────┘
                           │       │
              ┌────────────┘       └─────────────┐
              ▼                                  ▼
     ┌─────────────────┐                ┌─────────────────┐
     │   MongoDB Atlas │                │      Redis      │
     │   Main Database │                │     Caching     │
     └─────────────────┘                └─────────────────┘
              │
              │
              ▼
     ┌─────────────────┐
     │    Cloudinary   │
     │ Image Storage   │
     └─────────────────┘

                    ┌──────────────────────┐
                    │      Socket.IO       │
                    │ Real-time Events     │
                    └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology       | Purpose                      |
| ---------------- | ---------------------------- |
| React.js         | Frontend application         |
| React Router     | Routing                      |
| Tailwind CSS     | UI styling                   |
| Axios            | API communication            |
| Socket.IO Client | Real-time communication      |
| Tesseract.js     | OCR                          |
| Redux            | Client-side state management |

## Backend

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Runtime                 |
| Express.js | REST API                |
| MongoDB    | Database                |
| Mongoose   | ODM                     |
| Redis      | Caching                 |
| Socket.IO  | Real-time communication |
| Node-Cron  | Scheduled jobs          |
| Cloudinary | Image/file storage      |

## AI / OCR

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| Tesseract.js          | OCR                             |
| AI processing service | Medicine information extraction |

---

# 📁 Project Structure

A typical project structure is:

```text
MediReach/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── redux/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── cron/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

> The exact folder structure may vary depending on the current implementation.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <repository-url>

cd MediReach
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

AI_API_KEY=your_ai_api_key
```

> Never commit `.env` files or API keys to GitHub.

---

# ▶️ Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend and backend will run on their configured local development ports.

---

# 🧪 API Testing

Backend APIs can be tested using tools such as **Postman**.

Important API areas include:

```text
Authentication
Hospitals
Departments
Doctors
Patients
Appointments
Prescriptions
Pharmacy
Medicines
Emergency
Search
```

---

# 🔄 Core Healthcare Workflow

A typical patient journey looks like:

```text
Register
   │
   ▼
Search Hospital / Doctor
   │
   ▼
Select Doctor
   │
   ▼
Book Appointment
   │
   ▼
Doctor Consultation
   │
   ▼
Prescription Created
   │
   ▼
Medicine / Pharmacy
   │
   ▼
Digital Medical Record
```

In an emergency:

```text
Patient
   │
   ▼
Emergency Button
   │
   ▼
Hospital Receives Request
   │
   ▼
Hospital Acknowledges
   │
   ▼
Ambulance Assigned
   │
   ▼
Patient Receives Driver Details
   │
   ▼
Ambulance Reaches Patient
```

---

# 🎯 Project Goals

MediReach aims to:

* Improve access to healthcare services
* Reduce unnecessary travel for patients
* Improve continuity of medical information
* Digitize healthcare workflows
* Connect patients with doctors and hospitals
* Simplify pharmacy inventory management
* Reduce manual medicine data entry
* Provide faster emergency coordination
* Enable real-time healthcare communication

---

# 🔮 Future Scope

Potential future improvements include:

* 📱 Dedicated mobile application
* 🧠 AI-based preliminary symptom assistance
* 🩺 AI-assisted medical report analysis
* 📄 Complete digital health records
* 🔗 Hospital-to-hospital referral system
* 🗺️ Live ambulance tracking
* 📍 Nearby hospital discovery
* 🌐 Multilingual support
* 📶 Offline/low-connectivity support
* 📊 Healthcare analytics dashboards
* 🔔 Advanced notification system
* 💳 Digital payments
* 🧪 Diagnostic/lab integration
* 🏥 Telemedicine support

---

# 🔒 Security Considerations

MediReach is designed with security-conscious practices including:

* Role-based authorization
* Protected frontend routes
* Backend authorization middleware
* Environment-based secret management
* JWT-based authentication
* Secure API communication
* Restricted access to role-specific resources

Sensitive credentials and API keys should always be stored using environment variables.

---

# 📌 Current Development Status

| Module                         | Status |
| ------------------------------ | ------ |
| Authentication & Authorization | 🟢     |
| Hospital Management            | 🟢     |
| Department Management          | 🟢     |
| Doctor Management              | 🟢     |
| OPD Scheduling                 | 🟢     |
| Appointment System             | 🟢     |
| Doctor Dashboard               | 🟢     |
| Prescription Backend           | 🟢     |
| Prescription UI Integration    | 🟡     |
| Pharmacy Management            | 🟢     |
| Medicine Inventory             | 🟢     |
| Medicine OCR                   | 🟢/🟡  |
| Medicine Expiry Automation     | 🟢     |
| Redis Caching                  | 🟢     |
| Socket.IO Infrastructure       | 🟢/🟡  |
| Patient Search                 | 🟢/🟡  |
| Emergency/Ambulance Workflow   | 🟡     |
| End-to-End Integration         | 🟡     |
| Production Deployment          | 🔵     |

**Legend**

* 🟢 Implemented
* 🟡 In progress / requires integration & testing
* 🔵 Planned

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add: your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 👩‍💻 Team

**MediReach** is developed as a technology-driven healthcare solution focused on improving accessibility, continuity, and efficiency in healthcare delivery.

---

# 📄 License

This project is currently developed for educational, research, and prototype purposes.

Add an appropriate open-source license before distributing the project publicly.

---

## ❤️ MediReach

> **Connecting Patients. Empowering Doctors. Supporting Hospitals. Simplifying Healthcare.**

**MediReach — Healthcare, within reach.**
