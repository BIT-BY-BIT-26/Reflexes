import { useState } from "react";
import axios from "axios";
import { MdMyLocation } from "react-icons/md";
import { FaHospital, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress
} from "@mui/material";
import api from "../api/axios";
import { ROLE } from "../constants/role";

const RegisterHospital = () => {
  const [formData, setFormData] = useState({
    name: "",
    hospitalLicense: "",
    email: "",
    phone_number: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const [locationFetched, setLocationFetched] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleGeoLocation = () => {
  setLocLoading(true);

  if (!navigator.geolocation) {
    toast.error("Geolocation not supported ❌");
    setLocLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setFormData((prev) => ({
        ...prev,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }));

      setLocationFetched(true);
      toast.success("Location captured 📍");
      setLocLoading(false);
    },
    (error) => {
      toast.error("Location access denied ❌");
      setLocLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.lat || !formData.lng) {
    toast.warning("Please fetch hospital location 📍");
    return;
  }

  const toastId = toast.loading("Registering hospital...");

  try {
    setLoading(true);

    // 1️⃣ API CALL ka response store karo
    const response = await api.post(
      "/hospitals",
      formData
    );
    console.log("API response:", response.data);


    // 2️⃣ TOKEN SAVE (ADMIN LOGIN AUTO)
    localStorage.setItem("token", response.data.accessToken);
    localStorage.setItem("role", ROLE.admin); // 🔥 THIS WAS MISSING
    localStorage.setItem("user", JSON.stringify(response.data.data.admin));

    // 3️⃣ SUCCESS TOAST
    toast.update(toastId, {
      render: "Hospital registered successfully 🎉",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });

    // 4️⃣ ADMIN DASHBOARD
    navigate("/");

  } catch (error) {
    toast.update(toastId, {
      render:
        error?.response?.data?.message || "Registration failed ❌",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  } finally {
    setLoading(false);
  }
};


 const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fafafa",
    fontSize: "0.85rem",   // 👈 input ke andar text size
  },

  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",    // 👈 label ka size
  },

  "& .MuiInputBase-input": {
    padding: "8.5px 12px", // 👈 input height kam
    fontSize: "0.85rem",   // 👈 typed text size
  },

  "& .MuiInputLabel-shrink": {
    fontSize: "0.75rem",   // 👈 upar jaane ke baad label
  }
};

    const handleGoogleAuth = async(req,res)=>{
      try{
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth,provider)
        console.log(result);
      }catch(error){

      }
    }

  return (
    <Box sx={{ minHeight: "100vh",alignItems: "stretch",  display: "flex", backgroundColor:"#7177a8" }}>
      {/* LEFT SECTION */}
      <Box
        sx={{
          m: 2,
          borderRadius: "8px",
          flex: 1,
          backgroundColor: "#1f2342",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 3
        }}
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 600, mb: 2 }}
        >
        Streamline Your Hospital's OPD Management
      </Typography>

    <Typography variant="body1" sx={{ opacity: 0.85 }}>
      Efficient queue management for modern healthcare.
    </Typography>

          <Box
            component="ul"
            sx={{
              mt: 2,
              pl: 0,listStyle: "none","& li": {mb: 0.8,fontSize: "0.85rem",opacity: 0.85}
            }}
          >
          <li>✔ Real-time OPD queue monitoring</li>
          <li>✔ Easy doctor & department management</li>
          <li>✔ Patient app integration ready</li>
        </Box>
      </Box>

      {/* RIGHT SECTION */}
      <Box
        sx={{
           m: 2,
    flex: 1,
    display: "flex",
    alignItems: "stretch" // 👈 yahin magic hai
        }}
      >
        <Paper
          elevation={3}
          sx={{
            mt:2,
            p: 4,
            borderRadius: 3,
            width: "100%",
            height:"100%",
            maxWidth: 800
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
          >
            <FaHospital /> Register Your Hospital
          </Typography>

          {/* Hospital Info */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Hospital Information
            </Typography>
            <Grid container columnSpacing={2} rowSpacing={1.5}>
              <Grid item xs={12} >
                <TextField
                  fullWidth
                  label="Hospital Name"
                   sx={inputSx}
                   size="small"
                  name="name"
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} >
                <TextField
                  fullWidth
                  size="small"
                  label="Hospital License Number"
                  name="hospitalLicense"
                   sx={inputSx}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hospital Email"
                  name="email"
                  type="email"
                  sx={inputSx}
                  onChange={handleChange}
                  required
                  autoComplete="new-email"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                size="small"
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                   sx={inputSx}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                   sx={inputSx}
                  name="city"
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  size="small"
                   sx={inputSx}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  type="number"
                  size="small"
                   sx={inputSx}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid>
                <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            onClick={handleGeoLocation}
            startIcon={<MdMyLocation />}
          >
            Use Current Location
          </Button>
          {locationFetched && (
            <Typography variant="body2" color="success.main" align="center" mb={2}>
              📍 Location captured successfully
            </Typography>
          )}
              </Grid>
            </Grid>
          </Paper>

          {/* Location Button */}
          

          {/* Admin Info */}
         <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FaUserShield /> Admin Account
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Admin Name"
                  name="adminName"
                   sx={inputSx}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Email (Login)"
                  name="adminEmail"
                   sx={inputSx}
                   size="small"
                  type="email"
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Admin Password"
                  name="adminPassword"
                   sx={inputSx}
                  type="password"
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? "Registering..." : "Register Hospital"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={2}
          >
            Already registered?{" "}
            <Typography
              component="span"
              sx={{
                color: "primary.main",
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "underline"
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterHospital;
