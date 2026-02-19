import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegisterRole = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" mb={3} fontWeight={600}>
          Select Registration Type
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => navigate("/register")}
        >
          Hospital / Admin
        </Button>

        <Button
          fullWidth
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => navigate("/register-pharmacy")}
        >
          Pharmacy / Shopkeeper
        </Button>
      </Paper>
    </Box>
  );
};

export default RegisterRole;
