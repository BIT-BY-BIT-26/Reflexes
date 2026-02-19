import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { motion } from "framer-motion";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ROLE } from "../constants/role";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === ROLE.admin) navigate("/admin-dashboard");
      else if (role === ROLE.doctor) navigate("/doctor-dashboard");
      else if (role === ROLE.patient) navigate("/patient-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/user-login", formData); // ✅ Correct endpoint

      toast.success(res.data.msg || "Login successful");

      // ✅ Store token & role correctly
      localStorage.setItem("token", res.data.token); // ❌ previously accessToken
      localStorage.setItem("role", res.data.role);

      // ✅ Navigate based on role
      if (res.data.role === ROLE.admin) navigate("/admin-dashboard");
      else if (res.data.role === ROLE.doctor) navigate("/doctor-dashboard");
      else if (res.data.role === ROLE.patient) navigate("/patient-dashboard");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleTogglePassword = () => {
  setShowPassword((prev) => !prev);
};


  return (
    <Box
      component={motion.div}
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:0.8}}
      display="flex"
      minHeight="100vh"
      minWidth="100vw"
      bgcolor="#f5f7fa"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #07193a 0%, #2a5298 100%)"
      }}
    >
      <Paper
      component={motion.div}
      initial={{y:80, opacity:0, scale:0.9}}
      animate={{y:0,opacity:1,scale:1}}
      transition={{duration:0.6, ease:"easeOut"}}
        elevation={4} sx={{ p: 4, width: 500, borderRadius: 3,backdropFilter: "blur(12px)",background: "rgba(255,255,255,0.15)",border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 32px rgba(124, 124, 124, 0.2)"}}>
        <Typography variant="h5" align="center" mb={3} fontWeight={600} color="white" component={motion.h5} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Login to Medireach
        </Typography>

        <form onSubmit={handleLogin}>
          <motion.div whileFocus={{scale:1.02}}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              size="small"
              variant="outlined"
              autoComplete="off"
              
              onChange={handleChange}
              sx={{
                mb: 2,

                "& .MuiInputLabel-root": {
                  color: "white"
                },

                "& .MuiInputLabel-root.Mui-focused": {
                  color: "white"
                },

                "& .MuiOutlinedInput-root": {
                  color: "white",

                  "& fieldset": {
                    borderColor: "white"
                  },

                  "&:hover fieldset": {
                    borderColor: "white"
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "white"
                  }
                }
              }}

            />

          </motion.div>
          <motion.div whileFocus={{ scale: 1.02 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword?"text":"password"}
              variant="outlined"
              size="small"
              autoComplete="new-password"
              
              sx={{
                mb: 2,

                "& .MuiInputLabel-root": {
                  color: "white"
                },

                "& .MuiInputLabel-root.Mui-focused": {
                  color: "white"
                },

                "& .MuiOutlinedInput-root": {
                  color: "white",

                  "& fieldset": {
                    borderColor: "white"
                  },

                  "&:hover fieldset": {
                    borderColor: "white"
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "white"
                  }
                }
              }}

              onChange={handleChange}
              InputProps={{
                endAdornment:(
                  <InputAdornment position="end">
                     <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "white" }} />
                      ) : (
                        <Visibility sx={{ color: "white" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </motion.div>

          <Typography
            variant="body2"
            align="right"
            sx={{
              mb: 2,
              cursor: "pointer",
              color: "#e3f2fd"
            }}
            component={motion.p}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Typography>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.3,
                fontWeight: 700,
                borderRadius: 3,
                background:
                  "linear-gradient(90deg, #00c6ff, #0072ff)"
              }}
              startIcon={
                loading && <CircularProgress size={20} color="inherit" />
              }
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </motion.div>
        </form>

         <Typography
          variant="body2"
          align="center"
          mt={3}
          color="#e3f2fd"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don’t have an account?{" "}
          <span
            style={{
              color: "#bbdefb",
              cursor: "pointer",
              fontWeight: 600
            }}
            // onClick={() => navigate("/register")}
            onClick={() => navigate("/register-role")}
          >
            Register
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
