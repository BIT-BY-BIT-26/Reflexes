import { useState } from "react";
import { MdMyLocation } from "react-icons/md";
import { FaStore, FaUserShield } from "react-icons/fa";
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

const RegisterPharmacy = () => {
  const [formData, setFormData] = useState({
    shopName: "",
    licenseNumber: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    ownerName: "",
    password: ""
});


  const [locationFetched, setLocationFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported ❌");
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
      },
      () => toast.error("Location access denied ❌")
    );
  };

  const handleSubmit = async () => {
    if (!formData.lat || !formData.lng) {
      toast.warning("Please capture location 📍");
      return;
    }

    try {
      setLoading(true);

      await api.post("/pharmacy/register", formData);

      toast.success("Pharmacy registered! Await admin approval.");
      navigate("/pharmacy-dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fafafa",
      fontSize: "0.85rem",
    },
    "& .MuiInputLabel-root": { fontSize: "0.8rem" },
    "& .MuiInputBase-input": { padding: "8.5px 12px", fontSize: "0.85rem" },
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", backgroundColor: "#7177a8" }}>
      
      {/* LEFT INFO PANEL */}
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
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Expand Your Pharmacy Reach
        </Typography>

        <Typography sx={{ opacity: 0.85 }}>
          Connect with nearby patients & hospitals instantly.
        </Typography>

        <Box component="ul" sx={{ mt: 2, listStyle: "none", pl: 0 }}>
          <li>✔ Increase medicine visibility</li>
          <li>✔ Receive real-time medicine requests</li>
          <li>✔ Grow local customer base</li>
        </Box>
      </Box>

      {/* RIGHT FORM PANEL */}
      <Box sx={{ m: 2, flex: 1, display: "flex" }}>
        <Paper sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 800 }}>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", gap: 1 }}>
            <FaStore /> Register Your Pharmacy
          </Typography>

          {/* Shop Info */}
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Pharmacy Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Shop Name" name="shopName" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Drug License Number" name="licenseNumber" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" name="email" type="email" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone" name="phone" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="City" name="city" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="State" name="state" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Pincode" name="pincode" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Full Address"
                    name="address"
                    sx={inputSx}
                    size="small"
                    onChange={handleChange}
                    required
                />
                </Grid>


              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleGeoLocation}
                  startIcon={<MdMyLocation />}
                >
                  Use Current Location
                </Button>

                {locationFetched && (
                  <Typography color="green" mt={1}>
                    📍 Location captured
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Owner Account */}
          <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Typography sx={{ display: "flex", gap: 1, mb: 1 }}>
              <FaUserShield /> Owner Account
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Owner Name" name="ownerName" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Login Password" name="password" type="password" sx={inputSx} size="small" onChange={handleChange} required />
              </Grid>
            </Grid>
          </Paper>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Registering..." : "Register Pharmacy"}
          </Button>

          <Typography align="center" mt={2}>
            Already registered?{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterPharmacy;
