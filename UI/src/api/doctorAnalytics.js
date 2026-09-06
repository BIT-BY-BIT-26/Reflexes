import api from "./axiosInstance";

export const getDoctorAnalytics = async (days = 30) => {
  const response = await api.get(
    `/doctor-analytics?days=${days}`
  );

  return response.data;
};