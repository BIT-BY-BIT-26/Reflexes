import axios from "axios";
const API="http://localhost:3000/api"

export const platformLogin = (email,password)=>{
  return axios.post(`${API}/platform/login`,{
    email,password
  })
}

export const signup = (email,password)=>{
    return axios.post(`${API}/signup`);
}

export const registerHospital = (hospitalData) => {
  return axios.post(`${API}/hospitals`, hospitalData);
};

export const logout = ()=>{
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = '/login';
}

export const getHospitalProfile = async()=>{
  const token = localStorage.getItem("token");
  return axios.get(`${API}/profile`,{
    headers:{
      Authorization:`Bearer ${token}`,
    },
  });
}