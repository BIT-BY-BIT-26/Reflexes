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

// export const logout = ()=>{
//   localStorage.removeItem("token");
//   localStorage.removeItem("role");
//   window.location.href = '/login';
// }

// export const getHospitalProfile = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/profile`,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     },
//   });
// }

// // export const getStats = async()=>{
// //   const token = localStorage.getItem("token");
// //   return axios.get(`${API}/statistics`,{
// //     headers:{
// //       Authorization:`Bearer ${token}`,
// //     },
// //   });
// // }

// export const DepartmentsDoctorsCount = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/departments/doctor-count`,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// }


// export const addDepartment = async(data)=>{
//   const token = localStorage.getItem("token");
//   return axios.post(`${API}/departments`,data,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// } 

// export const addDoctor = async(data)=>{
//   const token = localStorage.getItem("token");
//   return axios.post(`${API}/doctors/add-doctor`,data,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// } 

// export const getAllDoctors = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/doctors/get-doctors`,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// }

// export const updateHospitalProfile = async (data) => {
//   const token = localStorage.getItem("token");

//   return axios.patch(
//     `${API}/profile`,
//     data,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );
// };

// //----------------Doctor-------------------

// export const getDoctorDashboard = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/doctors/all-data`,{
//     headers:{
//       Authorization:`Bearer ${token}`
//     }
//   })
// }


// export const getAllDepartments = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/departments`,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// }

// export const profileCompleted = async(data)=>{
//   const token = localStorage.getItem("token");
//   return axios.post(`${API}/departments`,data,{
//     headers:{
//       Authorization:`Bearer ${token}`,
//     }
//   })
// }

// export const getDoctorStatus = async()=>{
//   const token = localStorage.getItem("token");
//   return axios.get(`${API}/doctors/profile-status`,{headers:{
//     Authorization:`Bearer ${token}`
//   }})
// }

// export const submitProfile = async(data)=>{
//   const token = localStorage.getItem("token");
//   return axios.post(`${API}/doctors/submit-profile`,data,{
//     headers: {Authorization:`Bearer ${token}`}
//   })
// }



import api from "./axiosInstance";

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