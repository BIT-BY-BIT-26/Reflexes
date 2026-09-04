// import axios from "axios";
// const API="http://localhost:3000/api"

// export const platformLogin = (email,password)=>{
//   return axios.post(`${API}/platform/login`,{
//     email,password
//   })
// }

// export const signup = (email,password)=>{
//     return axios.post(`${API}/signup`);
// }

// export const registerHospital = (hospitalData) => {
//   return axios.post(`${API}/hospitals`, hospitalData);
// };

// export const loginUser = (data) => {
//   return axios.post(
//     `${API}/auth/login`,
//     data
//   );
// };



import api from "./axiosInstance";

import axios from "axios";

// AI service alag hai — ismein apne backend ka token nahi jaana chahiye
const aiApi = axios.create({
  timeout: 60000, // Render free tier cold start me 50s tak so jaata hai
});

// ---------------- Platform ----------------

export const platformLogin = (email, password) =>
  api.post("/platform/login", { email, password });

export const signup = (data) =>
  api.post("/signup", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

// ---------------- Hospital ----------------

export const registerHospital = (hospitalData) =>
  api.post("/hospitals", hospitalData);

export const getHospitalProfile = () =>
  api.get("/profile");

export const updateHospitalProfile = (data) =>
  api.patch("/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getStats = () =>
  api.get("/statistics");

// ---------------- Departments ----------------

export const DepartmentsDoctorsCount = () =>
  api.get("/departments/doctor-count");


export const getDepartmentList = ()=>
  api.get("/departments/list");


export const addDepartment = (data) =>
  api.post("/departments", data);

export const getAllDepartments = () =>
  api.get("/departments");

// ---------------- Doctors ----------------

export const addDoctor = (data) =>
  api.post("/doctors/add-doctor", data);

export const getAllDoctors = () =>
  api.get("/doctors/get-doctors");

export const getDoctorDashboard = () =>
  api.get("/doctors/all-data");

export const getDoctorStatus = () =>
  api.get("/doctors/profile-status");

export const submitProfile = (data) =>
  api.post("/doctors/submit-profile", data);

export const profileCompleted = (data) =>
  api.post("/departments", data);

export const todaysAppointment = ()=>
  api.get('/appointments/today')

export const confirmAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/confirm`);


export const getConfirmedAppointments = ()=>
  api.get("/appointments/my",{
    params:{
      status:"CONFIRMED",
      appointmentType:"offline"
    }
  })
export const startOPD = () => api.patch("/doctors/toggle-opd");

// ⭐ id ko real param banao (backend ignore karta hai but URL structure follow karo)
export const startConsultation = () =>
  api.patch(`/consultation/start-consultation`);

export const stopConsultation = (id = "na") =>
  api.patch(`/consultation/stop-consultation/${id}`);

export const pauseConsultation = (id = "na") =>
  api.patch(`/consultation/pause-consultation/${id}`);

export const resumeConsultation = (id = "na") =>
  api.patch(`/consultation/resume-consultation/${id}`);

export const completeAppointment = (id = "na") =>
  api.patch(`/appointments/${id}/complete`);

export const callNext = () =>
  api.patch(`/consultation/call-next`);

export const skipPatient = () =>
  api.patch(`/consultation/skip-patient`);

export const getCurrentPatient = () =>
  api.get(`/consultation/current-patient`); // apna actual route yahan confirm kar lena


export const addMedicine = (data) => {
  return api.post(`/pharmacy/add-medicine`, data);
};

export const searchPatient = (data) => {
  return api.get("/search-patients", {
    params: {
      search: data,
    },
  });
};

export const getPatientProfile = (patientId) => {
  return api.get(`/patients/get-patient-profile/${patientId}`);
};

export const addPatientReport = (formData) => {
  return api.post("/upload-report", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const addPrescriptionImage = (formData) =>
  api.post(
    "/prescription/prescription-image-extract",
    formData
  );

export const PrescriptionDescription = (data) =>
  api.post(
    "/prescription/prescription-description-extract",
    data,
    { headers: { "Content-Type": "application/json" } }
  );

export const ManualPrescription = (data) => {
  return api.post(
    "/prescription/create-prescription",
    data
  );
};

export const getPatientHistory = (patientId) => {
  return api.get(`/doctors/patient-history/${patientId}`);
};


export const getAllHospitals = () => {
  return api.get(`/all-hospitals`);
};

export const HospitalSearch = (searchTerm) => {
  return api.get(`/search-hospitals`, {
    params: {
      search: searchTerm,
    },
  });
};


export const createReferral = (referralData) => {
  return api.post("/referral/create", referralData);
};