const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user"); // agar store kiya ho

  window.location.href = "/login";
};

export default logout;
